import { Avatar, styled, Popover } from "@mui/material"
import type { TProjectMemberData } from "../../../services/types"
import { useContext, useState, useEffect } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { useUserInProject } from "../../../hooks/user"
import { displayProjectRole, openFixedLoadingHandler, pureNavigator } from "../../../utils/helpers"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { EProjectRoles } from "../../../utils/enums"
import LogoutIcon from "@mui/icons-material/Logout"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import {
  removeMemberFromProject,
  updateMemberInProject,
  setProjectMembers,
} from "../../../redux/project/project-slice"
import { projectService } from "../../../services/project-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { checkUserPermission } from "../../../configs/user-permissions"
import { EventSourceContext } from "../../../lib/event-source-context"
import { ESSEEvents } from "../../../utils/enums"
import { taskService } from "../../../services/task-service"

type TRolesProps = {
  selectedMember: TProjectMemberData
  userInProject: TProjectMemberData
}

type TEditAuthorizationProps = {
  anchorEle: HTMLElement | null
  selectedMember: TProjectMemberData | undefined
  userInProject: TProjectMemberData
  onClose: () => void
}

const EditAuthorization = ({
  anchorEle,
  selectedMember,
  userInProject,
  onClose,
}: TEditAuthorizationProps) => {
  const project = useAppSelector((state) => state.project.project!)

  const leaveProject = () => {
    openFixedLoadingHandler(true)
    projectService
      .leaveProject(project.id)
      .then(() => {
        pureNavigator("", true)
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  const Roles = ({ selectedMember, userInProject }: TRolesProps) => {
    const userProjectRole = userInProject.projectRole
    const selectedMemberId = selectedMember.id
    const inactiveClass: string = "opacity-60 pointer-events-none"
    const hasPermission = checkUserPermission(userProjectRole, "assign-project-role")

    const dispatch = useAppDispatch()

    const assignUserProjectRole = (role: EProjectRoles, memberId: number) => {
      if (selectedMember.projectRole !== role) {
        dispatch(updateMemberInProject({ projectRole: role, id: memberId }))
      }
      onClose()
    }

    const removeFromProject = (memberId: number) => {
      openFixedLoadingHandler(true)
      projectService
        .removeMemberFromProject(project.id, memberId)
        .then(() => {
          dispatch(removeMemberFromProject(memberId))
          onClose()
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          openFixedLoadingHandler(false)
        })
    }

    return (
      <ul className="mt-1 text-modal-text-cl">
        <li
          onClick={() => assignUserProjectRole(EProjectRoles.LEADER, selectedMemberId)}
          className={`${hasPermission ? "" : inactiveClass} cursor-pointer hover:bg-hover-silver-bgcl py-2 px-3 text-sm font-medium`}
        >
          <p>Leader</p>
        </li>
        <li
          onClick={() => assignUserProjectRole(EProjectRoles.MEMBER, selectedMemberId)}
          className={`${hasPermission ? "" : inactiveClass} cursor-pointer hover:bg-hover-silver-bgcl py-2 px-3 text-sm font-medium`}
        >
          <p>Member</p>
        </li>
        {selectedMemberId === userInProject.id ? (
          <li
            onClick={leaveProject}
            className={`cursor-pointer hover:bg-hover-silver-bgcl py-2 px-3 text-sm font-medium`}
          >
            <div className="flex items-center justify-between gap-x-3">
              <span>Leave project</span>
              <LogoutIcon fontSize="small" />
            </div>
          </li>
        ) : (
          <li
            onClick={() => removeFromProject(selectedMemberId)}
            className={`${checkUserPermission(userProjectRole, "add-remove-project-member") ? "" : inactiveClass} cursor-pointer hover:bg-hover-silver-bgcl py-2 px-3 text-sm font-medium`}
          >
            <div className="flex items-center justify-between gap-x-3">
              <span>Remove from project</span>
              <LogoutIcon fontSize="small" />
            </div>
          </li>
        )}
      </ul>
    )
  }

  return (
    <StyledPopover
      open={!!anchorEle}
      anchorEl={anchorEle}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <div className="bg-transparent min-w-52 py-1 pb-3 relative">
        <header className="flex py-1 px-2 items-center">
          <h3 className="grow text-regular-text-cl font-semibold text-sm text-center">
            Authorization
          </h3>
          <button onClick={onClose} className="flex h-8 w-8 hover:bg-hover-silver-bgcl rounded">
            <CloseIcon fontSize="small" className="text-regular-text-cl m-auto" />
          </button>
        </header>
        {selectedMember && <Roles selectedMember={selectedMember} userInProject={userInProject} />}
      </div>
    </StyledPopover>
  )
}

type TMemberItemProps = {
  memberData: TProjectMemberData
  selected: boolean
  onOpenAuthorization: (
    e?: React.MouseEvent<HTMLButtonElement>,
    member?: TProjectMemberData,
  ) => void
  isUser: boolean
}

const MemberItem = ({ memberData, selected, onOpenAuthorization, isUser }: TMemberItemProps) => {
  const { id, avatar, fullName, email, projectRole } = memberData

  return (
    <div
      key={id}
      className={`${selected ? "bg-[#1C2B41]" : ""} flex items-center justify-between py-2 px-1 rounded`}
    >
      <div className="flex items-center gap-x-3">
        {avatar ? (
          <Avatar src={avatar} alt="User Avatar" sx={{ height: 32, width: 32 }} />
        ) : (
          <Avatar sx={{ height: 32, width: 32 }}>{avatar}</Avatar>
        )}
        <div className={`${selected ? "text-confirm-btn-bgcl" : ""} text-sm`}>
          <p className="font-medium leading-tight">{isUser ? `${fullName} (You)` : fullName}</p>
          <p className="text-xs leading-tight">{email}</p>
        </div>
      </div>
      {/* <button
        onClick={(e) => onOpenAuthorization(e, memberData)}
        className="flex items-center gap-x-1 px-3 py-1 rounded bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl"
      >
        <span className="text-sm">{displayProjectRole(projectRole)}</span>
        <KeyboardArrowDownIcon fontSize="small" className="text-modal-text-cl" />
      </button> */}
      <div className="flex items-center gap-x-1 px-3 py-1 rounded bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl">
        <span className="text-sm">{displayProjectRole(projectRole)}</span>
      </div>
    </div>
  )
}

type TProjectMembersProps = {
  projectMembers: TProjectMemberData[]
  active: boolean
}

export const ProjectMembers = ({ projectMembers, active }: TProjectMembersProps) => {
  const userInProject = useUserInProject()!
  const [anchorEle, setAnchorEle] = useState<HTMLElement | null>(null)
  const [selectedMember, setSelectedMember] = useState<TProjectMemberData>()
  const eventSource = useContext(EventSourceContext)
  const dispatch = useAppDispatch()
  const project = useAppSelector((state) => state.project.project!)

  const handleOpenAuthorization = (
    e?: React.MouseEvent<HTMLButtonElement>,
    member?: TProjectMemberData,
  ) => {
    setSelectedMember(member)
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  useEffect(() => {
    const projectMemberAddedListener = () => {
      projectService.getProjectMembers(project.id).then((members) => {
        dispatch(setProjectMembers(members))
      })
    }
    eventSource.current?.addEventListener(
      ESSEEvents.PROJECT_MEMBER_ADDED,
      projectMemberAddedListener,
    )
    return () => {
      eventSource.current?.removeEventListener(
        ESSEEvents.PROJECT_MEMBER_ADDED,
        projectMemberAddedListener,
      )
    }
  }, [])

  return (
    <>
      <div className="pt-2 space-y-1 h-full pr-1" hidden={!active}>
        {projectMembers.map((member) => (
          <MemberItem
            key={member.id}
            memberData={member}
            selected={selectedMember?.id === member.id}
            isUser={userInProject.id === member.id}
            onOpenAuthorization={handleOpenAuthorization}
          />
        ))}
      </div>

      <EditAuthorization
        anchorEle={anchorEle}
        onClose={() => handleOpenAuthorization()}
        selectedMember={selectedMember}
        userInProject={userInProject}
      />
    </>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})
