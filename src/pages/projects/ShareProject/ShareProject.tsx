import GroupAddIcon from "@mui/icons-material/GroupAdd"
import {
  AvatarGroup,
  Avatar,
  styled,
  Tooltip,
  Dialog,
  Fade,
  DialogContent,
  Chip,
} from "@mui/material"
import type { TProjectData, TSearchUserData, TUserData } from "../../../services/types"
import CloseIcon from "@mui/icons-material/Close"
import LinkIcon from "@mui/icons-material/Link"
import { openAppSnackbarHandler, openFixedLoadingHandler } from "../../../utils/helpers"
import { SimpleSnackbarTemplate } from "../../../components/NonInteractiveTemplates"
import { useCallback, useEffect, useRef, useState } from "react"
import { projectService } from "../../../services/project-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { userService } from "../../../services/user-service"
import { useDebounce } from "../../../hooks/debounce"
import { LogoLoading } from "../../../components/Loadings"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { updateProject } from "../../../redux/project/project-slice"
import { MemberAndRequests } from "./MemberAndRequests"
import { checkUserPermission } from "../../../configs/user-permissions"
import { useUserInProject } from "../../../hooks/user"

type TSearchStatus = "searching" | "search-done"

const SearchSection = () => {
  const project = useAppSelector((state) => state.project.project!)
  const inputRef = useRef<HTMLInputElement>(null)
  const [searchResult, setResult] = useState<TSearchUserData[]>()
  const [searchStatus, setSearchStatus] = useState<TSearchStatus>()
  const [pickedUsers, setPickedUsers] = useState<TSearchUserData[]>()
  const debounce = useDebounce()

  const searchUser = debounce(() => {
    const inputValue = inputRef.current?.value
    if (inputValue) {
      setSearchStatus("searching")
      userService
        .searchUsers(inputValue)
        .then((res) => {
          setResult(res)
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setSearchStatus("search-done")
        })
    } else {
      setResult(undefined)
      setSearchStatus(undefined)
    }
  }, 300)

  const sendInvitationHandler = () => {
    if (pickedUsers && pickedUsers.length > 0) {
      openFixedLoadingHandler(true)
      projectService
        .sendProjectInvitations(project.id, ...pickedUsers.map((user) => user.id))
        .then(() => {
          toast.success("Sent invitation successfully!")
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          openFixedLoadingHandler(false)
        })
    }
  }

  const pickUsers = (user: TSearchUserData) => {
    setPickedUsers((pre) => (pre && pre.length > 0 ? [...pre, user] : [user]))
  }

  const unpickUser = (userId: TSearchUserData["id"]) => {
    setPickedUsers((pre) => pre?.filter((user) => user.id !== userId))
  }

  const checkUserPicked = (
    userId: TSearchUserData["id"],
    pickedUsers: TSearchUserData[],
  ): boolean => {
    return pickedUsers.some((user) => user.id === userId)
  }

  return (
    <div className="flex gap-x-4 justify-between w-full">
      <div className="flex items-center flex-wrap gap-1 relative grow border-2 border-regular-border-cl bg-focused-textfield-bgcl rounded">
        {pickedUsers && pickedUsers.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {pickedUsers.map(({ id, fullName }) => (
              <Tooltip title={fullName} key={id} arrow>
                <StyledChip label={fullName} onDelete={() => unpickUser(id)} />
              </Tooltip>
            ))}
          </div>
        )}
        <input
          ref={inputRef}
          placeholder="Enter user's email address or name..."
          className="px-2 w-full py-1 bg-inherit focus:border-outline-cl hover:bg-[#2f363b]"
          onChange={searchUser}
        />
        {searchStatus && (
          <div className="flex flex-col text-sm z-20 css-styled-vt-scrollbar max-h-[300px] overflow-y-auto absolute top-[calc(100%+5px)] left-0 bg-modal-popover-bgcl rounded py-3 border border-regular-border-cl border-solid w-full">
            {searchStatus === "search-done" ? (
              searchResult && searchResult.length > 0 ? (
                searchResult.map(
                  (user) =>
                    !checkUserPicked(user.id, pickedUsers || []) && (
                      <div
                        key={user.id}
                        className="flex items-center gap-x-3 py-2 px-4 cursor-pointer hover:bg-modal-btn-hover-bgcl"
                        onClick={() => pickUsers(user)}
                      >
                        {user.avatar ? (
                          <Avatar
                            src={user.avatar}
                            alt="User Avatar"
                            sx={{ height: 32, width: 32 }}
                          />
                        ) : (
                          <Avatar sx={{ height: 32, width: 32 }}>{user.avatar}</Avatar>
                        )}
                        <div className="text-sm">
                          <p className="font-medium leading-tight">{user.fullName}</p>
                          <p className="text-xs leading-tight">{user.email}</p>
                        </div>
                      </div>
                    ),
                )
              ) : (
                <div className="m-auto">
                  <p>Look like that person is not in Trello yet.</p>
                  <p>Enter their email address to invite them now.</p>
                </div>
              )
            ) : (
              searchStatus === "searching" && (
                <div className="flex text-confirm-btn-bgcl w-fit m-auto p-2">
                  <LogoLoading />
                </div>
              )
            )}
          </div>
        )}
      </div>
      <button
        onClick={sendInvitationHandler}
        className="bg-confirm-btn-bgcl h-fit hover:bg-confirm-btn-hover-bgcl w-fit py-2 px-3 text-black text-sm rounded"
      >
        Share
      </button>
    </div>
  )
}

type TSharingSectionProps = {
  shareLink: string | null
  projectId: number
}

const SharingSection = ({ shareLink, projectId }: TSharingSectionProps) => {
  const [currentLink, setCurrentLink] = useState<string | null>(shareLink)
  const [loading, setLoading] = useState<boolean>()
  const dispatch = useAppDispatch()

  const copyShareLink = (link: string) => {
    navigator.clipboard.writeText(link)
    openAppSnackbarHandler(<SimpleSnackbarTemplate textContent="Copied link to clipboard" />)
  }

  const deleteShareLink = () => {
    // đã bỏ
    // setLoading(true)
    // projectService
    //    .deleteShareLink(projectId)
    //    .then(() => {
    //       setCurrentLink(null)
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
    //    .finally(() => {
    //       setLoading(false)
    //    })
  }

  const createNewLink = () => {
    // đã bỏ
    // setLoading(true)
    // projectService
    //    .createNewShareLink(projectId)
    //    .then((res) => {
    //       const { newshareLink } = res
    //       setCurrentLink(newshareLink)
    //       dispatch(updateProject({ shareLink: newshareLink }))
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
    //    .finally(() => {
    //       setLoading(false)
    //    })
  }

  useEffect(() => {
    setCurrentLink(shareLink)
  }, [shareLink])

  return (
    <div className="text-modal-text-cl w-full mt-5">
      <SearchSection />
      {/* <div className="mt-4 p-2 bg-modal-btn-bgcl rounded flex items-center justify-between">
        <div className="flex gap-x-2">
          <LinkIcon className="text-inherit" />
          <Tooltip title="Anyone with the link can join as a member" arrow>
            <span className="truncate max-w-[300px]">
              {currentLink || "You have no share link now..."}
            </span>
          </Tooltip>
        </div>
        {loading ? (
          <div className="flex mr-2">
            <LogoLoading size="small" />
          </div>
        ) : currentLink ? (
          <div className="flex gap-x-2 text-sm">
            <button
              onClick={() => copyShareLink(currentLink)}
              className="text-confirm-btn-bgcl hover:underline"
            >
              Copy link
            </button>
            <span>•</span>
            <button onClick={deleteShareLink} className="text-confirm-btn-bgcl hover:underline">
              Delete link
            </button>
          </div>
        ) : (
          <div className="flex gap-x-2 text-sm">
            <button onClick={createNewLink} className="text-confirm-btn-bgcl hover:underline">
              Create new link
            </button>
          </div>
        )}
      </div> */}
    </div>
  )
}

type TShareProjectProps = {
  projectData: TProjectData
}

export const ShareProject = ({ projectData }: TShareProjectProps) => {
  const { members, shareLink, id } = projectData
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const userInProject = useUserInProject()!

  const openUserPreview = (e: React.MouseEvent<HTMLElement>, userData: TUserData) => {
    eventEmitter.emit(EInternalEvents.OPEN_USER_PREVIEW, { anchorEle: e.currentTarget, userData })
  }

  return (
    <div className="flex items-center gap-x-3">
      <StyledAvatarGroup max={5} renderSurplus={(surplus) => <span>+{surplus.toString()[0]}</span>}>
        {members.map((member) => (
          <Tooltip key={member.id} title={member.fullName} arrow>
            {member.avatar ? (
              <Avatar
                alt="User Avatar"
                src={member.avatar}
                onClick={(e) => openUserPreview(e, member)}
              />
            ) : (
              <Avatar onClick={(e) => openUserPreview(e, member)}>{member.fullName[0]}</Avatar>
            )}
          </Tooltip>
        ))}
      </StyledAvatarGroup>
      <Tooltip title="Share this board with other people." arrow>
        <button
          onClick={() => setOpenDialog(true)}
          className="flex gap-x-1 items-center h-[32px] bg-[#FFFFFF] py-1 px-2 text-secondary-text-cl font-medium rounded"
        >
          <GroupAddIcon fontSize="small" />
          <span>Share</span>
        </button>
      </Tooltip>

      <StyledDialog
        slotProps={{
          transition: { timeout: 400 }
        }}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        scroll="body"
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <div className="flex flex-col rounded-xl min-h-[300px] w-full px-3 py-1">
            <header className="relative w-full">
              <h3 className="w-full text-lg font-bold text-regular-text-cl">Share project</h3>
              <button
                onClick={() => setOpenDialog(false)}
                className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
              >
                <CloseIcon className="text-regular-text-cl" />
              </button>
            </header>
            {checkUserPermission(userInProject.projectRole, "add-remove-project-member") && (
              <SharingSection shareLink={shareLink} projectId={id} />
            )}
            <MemberAndRequests projectMembers={members} projectId={id} />
          </div>
        </DialogContent>
      </StyledDialog>
    </div>
  )
}

const StyledAvatarGroup = styled(AvatarGroup)({
  "& .MuiAvatarGroup-avatar": {
    cursor: "pointer",
    height: 28,
    width: 28,
    border: "none",
    "&:hover": {
      outline: "2px solid white",
    },
  },
})

const StyledDialog = styled(Dialog)({
  "& .MuiPaper-root": {
    borderRadius: 9,
    backgroundColor: "var(--ht-modal-board-bgcl)",
    "& .MuiDialogContent-root": {
      backgroundColor: "var(--ht-modal-board-bgcl)",
      padding: 15,
    },
  },
})

const StyledChip = styled(Chip)({
  "&.MuiChip-root": {
    backgroundColor: "#a1bdd92e",
    height: "fit-content",
    padding: "3px 5px",
    "& .MuiChip-label": {
      color: "var(--ht-modal-text-cl)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      maxWidth: 150,
    },
    "& svg": {
      fill: "var(--ht-modal-text-cl)",
      fontSize: 18,
    },
  },
})
