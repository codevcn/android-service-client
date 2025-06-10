import { useEffect, useRef } from "react"
import { EInternalEvents, eventEmitter } from "../utils/events"
import { sanitizeHTMLString } from "../utils/helpers"

type TRichTextContentProps = {
   content: string
   wrapperClassName?: string
}

export const CustomRichTextContent = ({ content, wrapperClassName }: TRichTextContentProps) => {
   const contentWrapperRef = useRef<HTMLDivElement>(null)

   const initClickOnFileHandlers = () => {
      const fileTitles = contentWrapperRef.current?.querySelectorAll<HTMLSpanElement>(
         ".css-rich-file-title-template",
      )
      if (fileTitles && fileTitles.length > 0) {
         for (const fileTitle of fileTitles) {
            fileTitle.onclick = (e) => {
               e.stopPropagation()
               const { htFileId: fileId } = fileTitle.dataset
               if (fileId && fileId.length > 0) {
                  if (fileId) {
                     eventEmitter.emit(EInternalEvents.SHOW_UPLOADED_FILE_DETAILS, true, fileId)
                  }
               }
            }
         }
      }
   }

   useEffect(() => {
      initClickOnFileHandlers()
   }, [content])

   return (
      <div
         ref={contentWrapperRef}
         className={`css-rich-text-content-section ${wrapperClassName || ""}`}
         dangerouslySetInnerHTML={{ __html: sanitizeHTMLString(content) }}
      ></div>
   )
}
