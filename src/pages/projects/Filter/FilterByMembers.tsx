import {
   Popover,
   Fade,
   styled,
   FormControlLabel,
   RadioGroup,
   Radio,
   Avatar,
   Checkbox,
} from "@mui/material"
import { Fragment, useRef, useState } from "react"
import PermIdentityIcon from "@mui/icons-material/PermIdentity"
import { useUserInProject } from "../../../hooks/user"
import type { TProjectMemberData } from "../../../services/types"
import { useAppSelector } from "../../../hooks/redux"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import type { TFilterTasksData } from "../../../utils/types"
import { useForceUpdate } from "../../../hooks/rendering"

type TMemberItemProps = {
   memberData: TProjectMemberData
   picked: boolean
}

enum EPickMemberValues {
   NONE_OF_MEMBERS = "NONE_OF_MEMBERS",
   ASSIGNED_TO_ME = "ASSIGNED_TO_ME",
   ONE_MEMBER = "ONE_MEMBER",
}

type TFilterByMembersProps = {
   onFilter: (filterData: TFilterTasksData) => void
}

export const FilterByMembers = ({ onFilter }: TFilterByMembersProps) => {
   const userInProject = useUserInProject()!
   const { members } = useAppSelector(({ project }) => project.project!)
   const [anchorEle, setAnchorEle] = useState<HTMLElement | null>(null)
   const pickedMemberIdsRef = useRef<Set<TProjectMemberData["id"]>>(new Set([]))
   const pickedMembersCount = pickedMemberIdsRef.current.size
   const forceUpdate = useForceUpdate()
   const [clearFlag, setClearFlag] = useState<boolean>(false)

   const doFilter = () => {
      onFilter({ memberIds: Array.from(pickedMemberIdsRef.current) })
   }

   const openSelectMembersBoard = (e?: React.MouseEvent<HTMLElement>) => {
      if (e) {
         setAnchorEle(e.currentTarget)
      } else {
         setAnchorEle(null)
      }
   }

   const checkCheckedMember = (memberId: number): boolean =>
      pickedMemberIdsRef.current.has(memberId)

   const MemberItem = ({ memberData, picked }: TMemberItemProps) => {
      const { avatar, fullName, id } = memberData

      const pickMember = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
         if (checked) {
            pickedMemberIdsRef.current.add(id)
         } else {
            pickedMemberIdsRef.current.delete(id)
         }
         doFilter()
         forceUpdate()
      }

      return (
         <div className="px-4 hover:bg-hover-silver-bgcl w-full">
            <FormControlLabel
               control={
                  <StyledCheckbox size="small" defaultChecked={picked} onChange={pickMember} />
               }
               label={
                  <div className="flex items-center gap-x-1 w-full">
                     {avatar ? (
                        <Avatar src={avatar} sx={{ width: 24, height: 24 }} />
                     ) : (
                        <Avatar sx={{ width: 24, height: 24 }}>{fullName[0]}</Avatar>
                     )}
                     <p className="ml-1.5 max-w-40 truncate">{fullName}</p>
                  </div>
               }
            />
         </div>
      )
   }

   const pickMemberType = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value as EPickMemberValues
      switch (value) {
         case EPickMemberValues.NONE_OF_MEMBERS:
            pickedMemberIdsRef.current.clear()
            doFilter()
            break
         case EPickMemberValues.ASSIGNED_TO_ME:
            onFilter({ memberIds: [userInProject.id] })
            break
         case EPickMemberValues.ONE_MEMBER:
            pickedMemberIdsRef.current.clear()
            break
      }
      forceUpdate()
   }

   const clear = () => {
      onFilter({ memberIds: undefined })
      setClearFlag((pre) => !pre)
   }

   return (
      <Fragment key={clearFlag ? 1 : 0}>
         <div className="mt-6">
            <div className="flex justify-between items-center w-full">
               <h3 className="text-sm font-semibold mb-1">Members</h3>
               <button
                  onClick={clear}
                  className="text-xs py-0.5 px-3 bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl rounded"
               >
                  Clear
               </button>
            </div>
            <RadioGroup onChange={pickMemberType}>
               <FormControlLabel
                  value={EPickMemberValues.NONE_OF_MEMBERS}
                  control={<StyledRadio size="small" />}
                  label={
                     <div className="flex items-center gap-x-2 text-sm">
                        <PermIdentityIcon sx={{ width: 24, height: 24 }} />
                        <span>No members</span>
                     </div>
                  }
               />
               <FormControlLabel
                  value={EPickMemberValues.ASSIGNED_TO_ME}
                  control={<StyledRadio size="small" />}
                  label={
                     <div className="flex items-center gap-x-2 text-sm">
                        {userInProject.avatar ? (
                           <Avatar src={userInProject.avatar} sx={{ width: 24, height: 24 }} />
                        ) : (
                           <Avatar sx={{ width: 24, height: 24 }}>
                              {userInProject.fullName[0]}
                           </Avatar>
                        )}
                        <span>Tasks assigned to me</span>
                     </div>
                  }
               />
               <FormControlLabel
                  value={EPickMemberValues.ONE_MEMBER}
                  control={<StyledRadio size="small" />}
                  label={
                     <div
                        onClick={openSelectMembersBoard}
                        className="flex justify-between items-center text-sm"
                     >
                        <span>
                           {`${pickedMembersCount} ${pickedMembersCount > 1 ? "members" : "member"} selected`}
                        </span>
                        <KeyboardArrowDownIcon sx={{ width: 24, height: 24 }} />
                     </div>
                  }
               />
            </RadioGroup>
         </div>

         <SelectMembersBoard
            anchorEl={anchorEle}
            open={!!anchorEle}
            onClose={() => openSelectMembersBoard()}
            TransitionComponent={Fade}
            anchorOrigin={{
               vertical: "bottom",
               horizontal: "left",
            }}
            transformOrigin={{
               vertical: "top",
               horizontal: "left",
            }}
         >
            <div className="css-styled-vt-scrollbar max-h-[350px] overflow-y-auto bg-modal-popover-bgcl rounded-md py-3 text-regular-text-cl text-sm w-full">
               {members.map((member) => (
                  <MemberItem
                     key={member.id}
                     memberData={member}
                     picked={checkCheckedMember(member.id)}
                  />
               ))}
            </div>
         </SelectMembersBoard>
      </Fragment>
   )
}

const SelectMembersBoard = styled(Popover)({
   "& .MuiPaper-root": {
      borderRadius: 8,
      backgroundColor: "var(--ht-modal-popover-bgcl)",
      height: "fit-content",
      width: 312,
      border: "1px var(--ht-regular-border-cl) solid",
      "& .MuiList-root": {
         backgroundColor: "var(--ht-modal-popover-bgcl)",
         borderRadius: 8,
      },
   },
})

const StyledRadio = styled(Radio)({
   "& svg": {
      fill: "var(--ht-regular-text-cl)",
   },
   "& .MuiTouchRipple-child": {
      backgroundColor: "var(--ht-regular-text-cl)",
   },
})

const StyledCheckbox = styled(Checkbox)({
   "& svg": {
      fill: "var(--ht-regular-text-cl)",
   },
   "& .MuiTouchRipple-child": {
      backgroundColor: "var(--ht-regular-text-cl)",
   },
})
