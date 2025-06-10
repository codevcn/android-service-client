import { useEffect, useRef, useState } from "react"
import { useAppDispatch } from "../../../hooks/redux"
import { updateSinglePhase } from "../../../redux/project/project-slice"
import type { TPhaseData } from "../../../services/types"
import { styled, Dialog, DialogContent, Fade } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { EInternalEvents, eventEmitter } from "../../../utils/events"
import ReorderIcon from "@mui/icons-material/Reorder"
import { Editor as TinyMCEEditor } from "tinymce"
import { CustomRichTextContent } from "../../../components/RichTextContent"
import SubtitlesIcon from "@mui/icons-material/Subtitles"

export const AboutPhase = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [phaseData, setPhaseData] = useState<TPhaseData>()
  const [openEditor, setOpenEditor] = useState<boolean>(false)
  const editorRef = useRef<TinyMCEEditor>(null)
  const dispatch = useAppDispatch()

  useEffect(() => {
    eventEmitter.on(EInternalEvents.OPEN_ADD_PHASE_DESCRIPTION, (isOpen, phaseData) => {
      setPhaseData(phaseData)
      setOpen(isOpen)
    })
    return () => {
      eventEmitter.off(EInternalEvents.OPEN_ADD_PHASE_DESCRIPTION)
    }
  }, [])

  const saveDescription = (currentPhaseData: TPhaseData) => {
    const editor = editorRef.current
    if (editor) {
      const content = editor.getContent()
      if (content && content.length > 0) {
        const updates: TPhaseData = { ...currentPhaseData, description: content }
        dispatch(updateSinglePhase(updates))
        setPhaseData(updates)
        setOpenEditor(false)
      }
    }
  }

  const handleCloseBoard = () => {
    setOpenEditor(false)
    setOpen(false)
  }

  return (
    <StyledDialog
      TransitionComponent={Fade}
      open={open}
      onClose={handleCloseBoard}
      scroll="body"
      maxWidth="sm"
      fullWidth
      aria-hidden="true"
    >
      <DialogContent>
        <div className="flex flex-col rounded-xl min-h-[300px]">
          <header className="relative py-1 w-full">
            <h3 className="w-full text-center text-sm font-bold text-regular-text-cl">
              About phase
            </h3>
            <button
              onClick={handleCloseBoard}
              className="flex absolute right-0 top-0 p-1 rounded-md hover:bg-modal-btn-hover-bgcl"
            >
              <CloseIcon className="text-regular-text-cl" fontSize="small" />
            </button>
          </header>
          <hr className="mt-2" />
          {phaseData && (
            <>
              <div className="text-regular-text-cl mt-3">
                <div className="flex items-center gap-x-3">
                  <SubtitlesIcon />
                  <h3 className="font-bold">Title</h3>
                </div>
                <div className="mt-2 text-base py-2 px-3 rounded bg-modal-btn-bgcl">
                  {phaseData.title}
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-center gap-x-3">
                  <ReorderIcon className="text-regular-text-cl" />
                  <h3 className="text-regular-text-cl font-bold text-base">Description</h3>
                </div>
                <div hidden={true} className="mt-2">
                  {/* Rich text editor has been removed */}
                  <div className="flex gap-x-3 mt-2">
                    <button
                      onClick={() => saveDescription(phaseData)}
                      className="bg-confirm-btn-bgcl font-bold rounded hover:bg-outline-cl text-black text-sm py-2 px-3"
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
                <div
                  className="mt-2 py-2 px-3 rounded bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl cursor-pointer"
                  hidden={openEditor}
                  onClick={() => setOpenEditor(true)}
                >
                  <CustomRichTextContent content={phaseData.description || ""} />
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </StyledDialog>
  )
}

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
