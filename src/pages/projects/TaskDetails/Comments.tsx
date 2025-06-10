import { Avatar, Popover, styled, Tooltip } from "@mui/material"
import ChatIcon from "@mui/icons-material/Chat"
import { useUser, useUserInProject } from "../../../hooks/user"
import { displayTimeAgo } from "../../../utils/helpers"
import { addNewComment, deleteComment, updateComment } from "../../../redux/project/project-slice"
import type { TCommentData, TUserData } from "../../../services/types"
import { Editor as TinyMCEEditor } from "tinymce"
import { useEffect, useMemo, useRef, useState } from "react"
import { useAppDispatch } from "../../../hooks/redux"
import { CustomRichTextContent } from "../../../components/RichTextContent"
import { CustomRichTextEditor } from "../../../components/RichTextEditor"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import CloseIcon from "@mui/icons-material/Close"
import dayjs from "dayjs"
import { toast } from "react-toastify"
import { TIME_TO_DELETE_COMMENT, TIME_TO_EDIT_COMMENT } from "../../../utils/constants"
import CheckIcon from "@mui/icons-material/Check"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { commentService } from "../../../services/comment-service"
import axiosErrorHandler from "../../../utils/axios-error-handler"

type TDeleteCommentProps = {
  commentId: number
  createdAt: string
}

const DeleteComment = ({ commentId, createdAt }: TDeleteCommentProps) => {
  const [anchorEle, setAnchorEle] = useState<HTMLButtonElement | null>(null)
  const dispatch = useAppDispatch()

  const handleOpenConfirmDeleteComment = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      const deleteExpires = dayjs().isAfter(dayjs(createdAt).add(TIME_TO_DELETE_COMMENT, "hour"))
      if (deleteExpires) {
        toast.warn("User just can delete user's comment within 2 hours")
        return
      }
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const deleteCommentHandler = () => {
    commentService
      .deleteComment(commentId)
      .then(() => {
        dispatch(deleteComment(commentId))
        toast.success("Comment deleted successfully")
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
  }

  return (
    <>
      <button onClick={handleOpenConfirmDeleteComment} className="hover:underline text-xs">
        Delete
      </button>
      <StyledPopover
        open={!!anchorEle}
        anchorEl={anchorEle}
        onClose={() => handleOpenConfirmDeleteComment()}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <div className="bg-modal-popover-bgcl rounded-md p-3 text-regular-text-cl w-[300px]">
          <div className="relative w-full py-1">
            <h3 className="w-full text-center text-sm font-bold">Delete comment</h3>
            <button
              onClick={() => handleOpenConfirmDeleteComment()}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </div>
          <p className="text-sm mt-2">Deleting a comment is forever. There is no undo.</p>
          <button
            onClick={deleteCommentHandler}
            className="text-sm mt-2 bg-delete-btn-bgcl rounded-md p-1 w-full text-black font-bold hover:bg-delete-btn-hover-bgcl"
          >
            Delete comment
          </button>
        </div>
      </StyledPopover>
    </>
  )
}

type TUserCommentProps = {
  commentData: TCommentData
  onFocusEditor: (editorWrapperId: string) => void
  onBlurEditor: (editorWrapperId: string) => void
  loginedUser: TUserData
  hasCommentAsTaskResult: boolean
  taskId: number
}

const UserComment = ({
  commentData,
  onFocusEditor,
  onBlurEditor,
  loginedUser,
  hasCommentAsTaskResult,
  taskId,
}: TUserCommentProps) => {
  const { user, content, createdAt, id, isTaskResult } = commentData
  const [openEditor, setOpenEditor] = useState<boolean>(false)
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const dispatch = useAppDispatch()

  const editCommentHandler = () => {
    const editor = editorRef.current
    if (editor) {
      const content = editor.getContent()
      if (content && content.length > 0) {
        commentService
          .updateComment(id, content)
          .then(() => {
            dispatch(updateComment({ content, id }))
            setOpenEditor(false)
          })
          .catch((error) => {
            toast.error(axiosErrorHandler.handleHttpError(error).message)
          })
      }
    }
  }

  const handleOpenEditEditor = () => {
    const editExpires = dayjs().isAfter(dayjs(createdAt).add(TIME_TO_EDIT_COMMENT, "minute"))
    if (editExpires) {
      toast.warn("User just can edit user's comment within 15 minutes")
      return
    }
    setOpenEditor(true)
    eventEmitter.emit(EInternalEvents.OPENING_COMMENT_EDITOR, commentData.id)
  }

  useEffect(() => {
    const openCommentEditor = (commentId: number) => {
      setOpenEditor(commentId === commentData.id)
    }
    eventEmitter.on(EInternalEvents.OPENING_COMMENT_EDITOR, openCommentEditor)
    return () => {
      eventEmitter.removeListener(EInternalEvents.OPENING_COMMENT_EDITOR, openCommentEditor)
    }
  }, [])

  const handleMarkAsTaskResult = (isTaskResult: boolean) => {
    // đã bỏ
    // dispatch(updateComment({ id: commentData.id, isTaskResult }))
  }

  return (
    <div className="flex py-2">
      <div className="w-10 pt-1">
        {user.avatar ? (
          <Avatar src={user.avatar} sx={{ height: 32, width: 32 }} />
        ) : (
          <Avatar sx={{ height: 32, width: 32 }}>{user.fullName[0]}</Avatar>
        )}
      </div>
      {openEditor ? (
        <div className="w-full max-w-[500px]">
          <CustomRichTextEditor
            editorRef={editorRef}
            defaultContent={content || undefined}
            onFocus={() => onFocusEditor(`editor-wrapper-edit-comment-${id}`)}
            onBlur={() => onBlurEditor(`editor-wrapper-edit-comment-${id}`)}
            wrapperClassName="css-rich-text-editor-wrapper"
            wrapperId={`editor-wrapper-edit-comment-${id}`}
            taskId={taskId}
            userId={user.id}
          />
          <div className="flex gap-x-3 mt-2">
            <button
              onClick={editCommentHandler}
              className="bg-confirm-btn-bgcl rounded font-medium hover:bg-outline-cl text-black text-sm py-2 px-3"
            >
              Save
            </button>
            <button
              onClick={() => setOpenEditor(false)}
              className="hover:bg-modal-btn-hover-bgcl text-regular-text-cl text-sm font-semibold py-2 px-3 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-[500px]">
          <div className="flex gap-2 justify-between items-center text-regular-text-cl">
            <div className="flex items-center gap-x-3 pl-1">
              <p className="font-bold text-sm">{user.fullName}</p>
              <p className="text-xs">{displayTimeAgo(createdAt)}</p>
            </div>
            {isTaskResult && (
              <div className="flex gap-x-1 items-center text-xs text-success-text-cl font-bold pr-2 leading-none">
                <CheckCircleOutlineIcon sx={{ height: 14, width: 14 }} />
                <span>Task result</span>
              </div>
            )}
          </div>
          <div
            className={`${isTaskResult ? "border-success-text-cl" : "border-transparent"} css-task-details-user-comment border-2 border-solid relative bg-focused-textfield-bgcl p-2.5 mt-[2px] rounded-md leading-tight`}
          >
            <CustomRichTextContent content={content} wrapperClassName="break-words" />
          </div>
          {user.id === loginedUser.id && (
            <div className="flex justify-between gap-2 text-regular-text-cl mt-1 leading-none px-2">
              <div className="flex items-center gap-x-1">
                <button onClick={handleOpenEditEditor} className="hover:underline text-xs">
                  Edit
                </button>
                <span>•</span>
                <DeleteComment commentId={id} createdAt={createdAt} />
              </div>
              {/* {!hasCommentAsTaskResult &&
                (isTaskResult ? (
                  <Tooltip title="Unmark as task result" placement="top" arrow>
                    <button
                      onClick={() => handleMarkAsTaskResult(false)}
                      className="flex items-center gap-x-1 text-xs hover:text-delete-btn-bgcl hover:underline"
                    >
                      <CloseIcon sx={{ height: 16, width: 16 }} />
                      <span>Unmark as task result</span>
                    </button>
                  </Tooltip>
                ) : (
                  <Tooltip title="Mark as task result" placement="top" arrow>
                    <button
                      onClick={() => handleMarkAsTaskResult(true)}
                      className="flex items-center gap-x-1 text-xs hover:text-success-text-cl hover:underline"
                    >
                      <CheckIcon sx={{ height: 16, width: 16 }} />
                      <span>Mark as task result</span>
                    </button>
                  </Tooltip>
                ))} */}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type TUserEditorProps = {
  onFocusEditor: (editorWrapperId: string) => void
  onBlurEditor: (editorWrapperId: string) => void
  taskId: number
}

const MakeNewComment = ({ onBlurEditor, onFocusEditor, taskId }: TUserEditorProps) => {
  const [openEditor, setOpenEditor] = useState<boolean>(false)
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const dispatch = useAppDispatch()
  const user = useUserInProject()!

  const addNewCommentHandler = () => {
    const editor = editorRef.current
    if (editor) {
      const content = editor.getContent()
      if (content && content.length > 0) {
        console.log("content", content)
        commentService.createNewComment(taskId, user.id, content).then((comment) => {
          dispatch(
            addNewComment({
              content,
              createdAt: comment.createdAt,
              id: comment.id,
              user: comment.user,
              isTaskResult: comment.isTaskResult,
            }),
          )
          setOpenEditor(false)
          editor.setContent("")
        })
      }
    }
  }

  const openCommentEditor = () => {
    setOpenEditor(true)
    eventEmitter.emit(EInternalEvents.OPENING_COMMENT_EDITOR, -1)
  }

  useEffect(() => {
    const openEditorListener = (commentId: number) => {
      setOpenEditor(commentId === -1)
    }
    eventEmitter.on(EInternalEvents.OPENING_COMMENT_EDITOR, openEditorListener)
    return () => {
      eventEmitter.removeListener(EInternalEvents.OPENING_COMMENT_EDITOR, openEditorListener)
    }
  }, [])

  return (
    <div className="flex items-center mb-2">
      <div className="w-10">
        {user.avatar ? (
          <Avatar src={user.avatar} alt="User Avatar" sx={{ height: 32, width: 32 }} />
        ) : (
          <Avatar sx={{ height: 32, width: 32 }}>{user.fullName[0]}</Avatar>
        )}
      </div>
      <button
        onClick={openCommentEditor}
        className="px-3 py-2 rounded-md bg-focused-textfield-bgcl max-w-[500px] text-regular-text-cl w-full text-start hover:bg-[#292f35]"
        hidden={openEditor}
      >
        Write a comment...
      </button>
      <div className="w-full max-w-[500px]" hidden={!openEditor}>
        <CustomRichTextEditor
          editorRef={editorRef}
          placeholder="Write your comment here..."
          onFocus={() => onBlurEditor("editor-wrapper-make-new-comment")}
          onBlur={() => onFocusEditor("editor-wrapper-make-new-comment")}
          wrapperId="editor-wrapper-make-new-comment"
          wrapperClassName="css-rich-text-editor-wrapper"
          taskId={taskId}
          userId={user.id}
        />
        <div className="flex gap-x-3 mt-2">
          <button
            onClick={addNewCommentHandler}
            className="bg-confirm-btn-bgcl rounded font-medium hover:bg-outline-cl text-black text-sm py-2 px-3"
          >
            Save
          </button>
          <button
            onClick={() => setOpenEditor(false)}
            className="hover:bg-modal-btn-hover-bgcl text-regular-text-cl text-sm font-semibold py-2 px-3 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

type TCommentsProps = {
  comments: TCommentData[] | null
  taskId: number
}

export const Comments = ({ comments, taskId }: TCommentsProps) => {
  const editorsContainerRef = useRef<HTMLDivElement>(null)
  const user = useUser()!

  const hasCommentAsTaskResult = useMemo<boolean>(() => {
    return comments?.some(({ isTaskResult }) => isTaskResult) || false
  }, [comments])

  const focusBlurEditor = (editorWrapperId: string, type: "focus" | "blur") => {
    const editorWrapper = editorsContainerRef.current?.querySelector<HTMLDivElement>(
      `#${editorWrapperId}`,
    )
    if (editorWrapper) {
      editorWrapper.style.borderColor = type === "focus" ? "var(--ht-outline-cl)" : "#738496"
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center text-regular-text-cl">
        <div className="w-10">
          <ChatIcon />
        </div>
        <h3 className="text-base font-bold">Comments</h3>
      </div>
      <div className="mt-2 w-full" ref={editorsContainerRef}>
        <MakeNewComment
          onBlurEditor={(editorWrapperId) => focusBlurEditor(editorWrapperId, "blur")}
          onFocusEditor={(editorWrapperId) => focusBlurEditor(editorWrapperId, "focus")}
          taskId={taskId}
        />
        {comments &&
          comments.length > 0 &&
          comments.map((comment) => (
            <UserComment
              key={comment.id}
              commentData={comment}
              onBlurEditor={(editorWrapperId) => focusBlurEditor(editorWrapperId, "blur")}
              onFocusEditor={(editorWrapperId) => focusBlurEditor(editorWrapperId, "focus")}
              loginedUser={user}
              hasCommentAsTaskResult={hasCommentAsTaskResult}
              taskId={taskId}
            />
          ))}
      </div>
    </div>
  )
}

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})
