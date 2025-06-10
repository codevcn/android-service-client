import { Popover, Fade, styled, Avatar, Tooltip } from "@mui/material"
import { useEffect, useState } from "react"
import { EInternalEvents, eventEmitter } from "../utils/events"
import type { TUserPreviewBoardData } from "../utils/types"
import EditIcon from "@mui/icons-material/Edit"
import { useUserInProject } from "../hooks/user"
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye"
import { NavLink } from "react-router-dom"

export const UserPreview = () => {
  const [boardData, setBoardData] = useState<TUserPreviewBoardData>({
    anchorEle: null,
    userData: null,
  })
  const { anchorEle, userData } = boardData
  const userInProject = useUserInProject()!

  useEffect(() => {
    eventEmitter.on(EInternalEvents.OPEN_USER_PREVIEW, (boardData) => {
      setBoardData(boardData)
    })
    return () => {
      eventEmitter.off(EInternalEvents.OPEN_USER_PREVIEW)
    }
  }, [])

  const closeBoard = () => {
    setBoardData((pre) => ({ ...pre, anchorEle: null }))
  }

  return (
    <StyledPopover
      anchorEl={anchorEle}
      open={!!anchorEle}
      onClose={closeBoard}
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
      <div className="bg-transparent min-w-52 pb-3 border border-solid border-regular-border-cl rounded-lg text-modal-text-cl">
        {userData && (
          <>
            <div className="flex gap-x-3 px-3 py-5 w-full bg-gradient-to-b from-confirm-btn-bgcl to-confirm-btn-bgcl bg-no-repeat bg-[length:100%_82px]">
              <div>
                {userData.avatar ? (
                  <StyledAvatar src={userData.avatar} alt="User Avatar" />
                ) : (
                  <StyledAvatar>{userData.fullName[0]}</StyledAvatar>
                )}
              </div>
              <div className="text-black">
                <Tooltip title={userData.fullName} arrow>
                  <p className="font-bold text-base max-w-[150px] truncate">{userData.fullName}</p>
                </Tooltip>
                <p className="font-light text-xs">{userData.email}</p>
              </div>
            </div>
            <div className="w-full text-sm">
              {userData.id === userInProject.id ? (
                <NavLink
                  to={`/profile`}
                  className="flex items-center gap-x-2 hover:bg-modal-btn-hover-bgcl py-2 px-3 w-full text-start"
                >
                  <EditIcon fontSize="small" />
                  <span>Edit Profile Info</span>
                </NavLink>
              ) : (
                // <NavLink
                //   to={`/profile-preview/${userData.id}`}
                //   className="flex items-center gap-x-2 hover:bg-modal-btn-hover-bgcl py-2 px-3 w-full text-start"
                // >
                //   <RemoveRedEyeIcon fontSize="small" />
                //   <span>View Profile Info</span>
                // </NavLink>
                <></>
              )}
            </div>
          </>
        )}
      </div>
    </StyledPopover>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    height: "fit-content",
    width: 300,
    "& .MuiList-root": {
      backgroundColor: "var(--ht-modal-popover-bgcl)",
      borderRadius: 8,
    },
  },
})

const StyledAvatar = styled(Avatar)({
  height: 88,
  width: 88,
  border: "1px var(--ht-img-backdrop-bgcl) solid",
  backgroundColor: "var(--ht-img-backdrop-bgcl)",
})
