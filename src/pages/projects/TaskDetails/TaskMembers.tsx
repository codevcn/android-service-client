import { Avatar, Tooltip, AvatarGroup, styled, TextField, Popover } from "@mui/material"
import { useEffect, useMemo, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import type { TProjectMemberData, TTaskMemberData, TUserData } from "../../../services/types"
import AddIcon from "@mui/icons-material/Add"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { removeTaskMember } from "../../../redux/project/project-slice"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import { getAllMembersSelector } from "../../../redux/project/selectors"
import { useUserInProject } from "../../../hooks/user"
import { toast } from "react-toastify"
import { addNewTaskMemberAction } from "../../../redux/project/actions"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import type { TAddMembersBoardData } from "../../../utils/types"
import { checkUserPermission } from "../../../configs/user-permissions"
import { taskService } from "../../../services/task-service"
import axiosErrorHandler from "../../../utils/axios-error-handler"

const AddMemberBoard = () => {
  const { projectMembers, taskMembers } = useAppSelector(getAllMembersSelector())
  const [searchResult, setSearchResult] = useState<TProjectMemberData[]>()
  const dispatch = useAppDispatch()
  const userInProject = useUserInProject()!
  const [boardData, setBoardData] = useState<TAddMembersBoardData>()
  const anchorEle = boardData?.anchorEle || null

  const filteredProjectMembers = useMemo<TProjectMemberData[]>(() => {
    const list = searchResult ? searchResult : projectMembers
    if (taskMembers && taskMembers.length > 0) {
      return list.filter((member) => !taskMembers.some((taskMember) => taskMember.id === member.id))
    }
    return list
  }, [projectMembers, searchResult, taskMembers])

  const searchingMember = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = e.target.value
    if (inputValue && inputValue.length > 0) {
      setSearchResult(projectMembers.filter(({ fullName }) => fullName.includes(inputValue)))
    } else {
      setSearchResult(undefined)
    }
  }

  const handleAddRemoveTaskMember = (
    member: TTaskMemberData,
    isAdding: boolean,
    phaseId: number,
    taskId: number,
    projectId: number,
  ) => {
    if (checkUserPermission(userInProject.projectRole, "add-remove-task-member")) {
      if (isAdding) {
        dispatch(addNewTaskMemberAction(member, phaseId, taskId, projectId, handleCloseBoard))
      } else {
        taskService
          .removeMemberFromATask(taskId, member.id)
          .then(() => {
            dispatch(removeTaskMember({ memberId: member.id, phaseId, taskId }))
          })
          .catch((error) => {
            toast.error(axiosErrorHandler.handleHttpError(error).message)
          })
      }
    }
  }

  const handleCloseBoard = () => {
    setBoardData((pre) => (pre ? { ...pre, anchorEle: null } : undefined))
    setSearchResult(undefined)
  }

  useEffect(() => {
    eventEmitter.on(EInternalEvents.OPEN_ADD_TASK_MEMBERS_BOARD, (boardData) => {
      setBoardData(boardData)
    })
    return () => {
      eventEmitter.off(EInternalEvents.OPEN_ADD_TASK_MEMBERS_BOARD)
    }
  }, [])

  return (
    <StyledPopover
      open={!!anchorEle}
      anchorEl={anchorEle}
      onClose={handleCloseBoard}
      anchorOrigin={
        boardData?.anchorOrigin || {
          vertical: "bottom",
          horizontal: "left",
        }
      }
      transformOrigin={
        boardData?.transformOrigin || {
          vertical: "top",
          horizontal: "left",
        }
      }
    >
      {boardData ? (
        <div className="bg-modal-popover-bgcl rounded-md p-3 text-regular-text-cl w-[300px]">
          <header className="relative w-full py-1">
            <h3 className="w-full text-center text-sm font-bold">Members</h3>
            <button
              onClick={handleCloseBoard}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </header>
          <div className="w-full mt-2">
            <SearchInput
              multiline
              fullWidth
              maxRows={5}
              placeholder="Search members..."
              variant="outlined"
              onChange={searchingMember}
            />
          </div>
          {!searchResult && (
            <div className="mt-3 w-full">
              <h3 className="text-sm font-bold">Task members</h3>
              <div className="mt-2">
                {(taskMembers || []).map((member) => (
                  <div
                    key={member.id}
                    className="flex relative items-center gap-x-2 p-1 rounded-md cursor-pointer hover:bg-modal-btn-hover-bgcl"
                  >
                    {member.avatar ? (
                      <Avatar
                        alt="User Avatar"
                        src={member.avatar}
                        sx={{ height: 30, width: 30 }}
                      />
                    ) : (
                      <Avatar sx={{ height: 30, width: 30 }}>{member.fullName[0]}</Avatar>
                    )}
                    <span className="text-sm text-regular-text-cl">{member.fullName}</span>
                    <Tooltip title="Remove member">
                      <button
                        onClick={() =>
                          handleAddRemoveTaskMember(
                            member,
                            false,
                            boardData.phaseId,
                            boardData.taskId,
                            boardData.projectId,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <HighlightOffIcon fontSize="small" className="hover:scale-110" />
                      </button>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3 w-full">
            <h3 className="text-sm font-bold">Project members</h3>
            <div className="mt-2">
              {filteredProjectMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-x-2 p-1 rounded-md cursor-pointer hover:bg-modal-btn-hover-bgcl"
                  onClick={() =>
                    handleAddRemoveTaskMember(
                      member,
                      true,
                      boardData.phaseId,
                      boardData.taskId,
                      boardData.projectId,
                    )
                  }
                >
                  {member.avatar ? (
                    <Avatar alt="User Avatar" src={member.avatar} sx={{ height: 30, width: 30 }} />
                  ) : (
                    <Avatar sx={{ height: 30, width: 30 }}>{member.fullName[0]}</Avatar>
                  )}
                  <span className="text-sm text-regular-text-cl">{member.fullName}</span>
                </div>
              ))}
            </div>
            {filteredProjectMembers.length === 0 && (
              <div className="w-full text-regular-text-cl font-medium italic text-sm text-center mt-4">
                No member found
              </div>
            )}
          </div>
        </div>
      ) : (
        <span></span>
      )}
    </StyledPopover>
  )
}

const CurrentTaskMembers = () => {
  const taskMembers = useAppSelector(({ project }) => project.taskData!.members)

  const openUserPreview = (e: React.MouseEvent<HTMLElement>, userData: TUserData) => {
    eventEmitter.emit(EInternalEvents.OPEN_USER_PREVIEW, { anchorEle: e.currentTarget, userData })
  }

  return (
    <StyledAvatarGroup max={5} renderSurplus={(surplus) => <span>+{surplus.toString()[0]}</span>}>
      {taskMembers &&
        taskMembers.length > 0 &&
        taskMembers.map((member) => (
          <Tooltip key={member.id} title={member.fullName} arrow>
            {member.avatar ? (
              <Avatar
                alt="User Avatar"
                src={member.avatar}
                sx={{ height: 30, width: 30 }}
                onClick={(e) => openUserPreview(e, member)}
              />
            ) : (
              <Avatar
                alt="User Avatar"
                sx={{ height: 30, width: 30 }}
                onClick={(e) => openUserPreview(e, member)}
              >
                {member.fullName[0]}
              </Avatar>
            )}
          </Tooltip>
        ))}
    </StyledAvatarGroup>
  )
}

type TTaskMembersProps = {
  phaseId: number
  taskId: number
  projectId: number
}

export const TaskMembers = ({ phaseId, taskId, projectId }: TTaskMembersProps) => {
  const userInProject = useUserInProject()!
  const { projectRole } = userInProject
  const taskMembers = useAppSelector(({ project }) => project.taskData!.members)

  const openAddMemberBoard = (e: React.MouseEvent<HTMLButtonElement>) => {
    eventEmitter.emit(EInternalEvents.OPEN_ADD_TASK_MEMBERS_BOARD, {
      anchorEle: e.currentTarget,
      phaseId,
      taskId,
      projectId,
    })
  }

  const noMembers = useMemo(() => {
    return !taskMembers || taskMembers.length === 0
  }, [taskMembers])

  return (
    <div className="pl-10">
      <h3 className="text-regular-text-cl font-semibold text-sm">Members</h3>
      <div className="flex items-center gap-x-2 mt-1">
        <CurrentTaskMembers />
        {noMembers && checkUserPermission(projectRole, "add-remove-task-member") && (
          <Tooltip title="Add member">
            <button
              onClick={openAddMemberBoard}
              className="flex h-fit p-1 rounded-full bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl"
            >
              <AddIcon className="text-regular-text-cl" sx={{ height: 26, width: 26 }} />
            </button>
          </Tooltip>
        )}
      </div>
      <AddMemberBoard />
    </div>
  )
}

const StyledAvatarGroup = styled(AvatarGroup)({
  "& .MuiAvatarGroup-avatar": {
    cursor: "pointer",
    height: 32,
    width: 32,
    border: "none",
    "&:hover": {
      outline: "2px solid white",
    },
  },
})

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})

const SearchInput = styled(TextField)({
  "& .MuiInputBase-formControl": {
    width: "100%",
    padding: "5px 8px",
    border: "1px #738496 solid",
    "& .MuiInputBase-input": {
      width: "100%",
      color: "var(--ht-regular-text-cl)",
      fontWeight: 700,
      fontSize: "0.9rem",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "transparent",
    },
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "transparent",
      },
    },
    "&.Mui-focused": {
      backgroundColor: "var(--ht-focused-textfield-bgcl)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "var(--ht-outline-cl)",
      },
    },
  },
})
