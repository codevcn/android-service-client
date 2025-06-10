import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"

type TRichFileTitleTemplateProps = {
   textContent: string
   fileId: number
}

export const RichFileTitleTemplate = ({ textContent, fileId }: TRichFileTitleTemplateProps) => (
   <span className="css-rich-file-title-template" data-ht-file-id={fileId}>
      {textContent}
   </span>
)

type TCopiedTemplateProps = {
   textContent: string
}

export const SimpleSnackbarTemplate = ({ textContent }: TCopiedTemplateProps) => (
   <div className="flex items-center gap-x-3 text-success-text-cl">
      <CheckCircleOutlineIcon fontSize="small" className="text-success-text-cl" />
      <span>{textContent}</span>
   </div>
)
