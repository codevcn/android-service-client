import { useProjectMenuContext, type TProjectMenuActive } from "./sharing"
import { ProjectMenuSlider } from "./ProjectMenuSlider"
import ImageIcon from "@mui/icons-material/Image"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import { Modal, styled } from "@mui/material"
import { useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { projectService } from "../../../services/project-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import { LogoLoading } from "../../../components/Loadings"
import { useAppDispatch } from "../../../hooks/redux"
import { updateProject } from "../../../redux/project/project-slice"

type TCurrentBackgroundProps = {
  projectBackground: string | null
}

const CurrentBackground = ({ projectBackground }: TCurrentBackgroundProps) => {
  const [open, setOpen] = useState<boolean>(false)

  return projectBackground ? (
    <div className="w-full">
      <h2 className="text-base font-bold mb-2">Current background</h2>
      <button onClick={() => setOpen(true)} className="w-full">
        <img src={projectBackground} alt="Current background" className="h-[160px] w-full" />
      </button>

      <StyledModal open={open} onClose={() => setOpen(false)}>
        <div className="flex relative bg-transparent text-white h-full w-full">
          <div
            onClick={() => setOpen(false)}
            className="absolute top-3 right-7 hover:bg-modal-btn-hover-bgcl p-2 cursor-pointer rounded-md"
          >
            <CloseIcon />
          </div>
          <div className="m-auto h-full py-5 px-20">
            <img src={projectBackground} alt="Current background" className="h-full" />
          </div>
        </div>
      </StyledModal>
    </div>
  ) : (
    <p>No backgrounds available</p>
  )
}

type TUpdateBackgroundProps = {
  projectId: number
}

const UpdateBackground = ({ projectId }: TUpdateBackgroundProps) => {
  const [uploading, setUploading] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    // đã bỏ
    // const image = e.target.files?.[0]
    // if (image) {
    //    setUploading(true)
    //    projectService
    //       .updateProjectBackground(projectId, image)
    //       .then((res) => {
    //          toast.success("Update project's background successfully")
    //          dispatch(updateProject({ background: res.imageURL }))
    //       })
    //       .catch((error) => {
    //          toast.error(axiosErrorHandler.handleHttpError(error).message)
    //       })
    //       .finally(() => {
    //          setUploading(false)
    //       })
    // }
  }

  return (
    <div className="text-regular-text-cl">
      <h2 className="text-base font-bold mb-2">Upload background</h2>
      {uploading ? (
        <div className="flex flex-col items-center justify-center w-full bg-regular-bgcl rounded-lg p-5 h-[118px]">
          <LogoLoading />
          <p className="pt-7 text-sm">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-2 bg-regular-bgcl rounded-lg">
          <input
            id="upload-project-background-input"
            type="file"
            accept="image/*"
            hidden
            onChange={pickImage}
          />
          <label
            htmlFor="upload-project-background-input"
            className="flex items-center justify-center flex-col gap-2 text-center relative w-full py-5 px-5 border-2 border-dashed border-regular-text-cl rounded-lg cursor-pointer hover:bg-[#2a2d31] transition-colors duration-300"
          >
            <CloudUploadIcon sx={{ height: 30, width: 30 }} />
            <p>Upload a new background</p>
          </label>
        </div>
      )}
    </div>
  )
}

type TProjectBackgroundProps = {
  projectBackground: string | null
  projectId: number
}

export const ProjectBackground = ({ projectBackground, projectId }: TProjectBackgroundProps) => {
  const { setActiveMenuItem, activeMenuItem } = useProjectMenuContext()
  const isActive = activeMenuItem === "project-background"

  const handleOpen = (isOpen: boolean, menuItemName: TProjectMenuActive) => {
    if (isOpen) {
      setActiveMenuItem(menuItemName)
    } else {
      setActiveMenuItem(undefined)
    }
  }

  return (
    <>
      <button
        onClick={() => handleOpen(true, "project-background")}
        className="flex items-center gap-x-3 p-2 hover:bg-modal-btn-hover-bgcl rounded w-full mt-1"
      >
        {projectBackground ? (
          <img src={projectBackground} alt="Project background" className="h-5 w-5 rounded" />
        ) : (
          <ImageIcon sx={{ height: 20, width: 20 }} color="inherit" className="rounded" />
        )}
        <div>
          <p className="w-fit">Project background</p>
          <p className="text-xs font-light opacity-80">Change project's background</p>
        </div>
      </button>

      <ProjectMenuSlider active={isActive}>
        <div>
          <CurrentBackground projectBackground={projectBackground} />
          <hr className="my-3" />
          <UpdateBackground projectId={projectId} />
        </div>
      </ProjectMenuSlider>
    </>
  )
}

const StyledModal = styled(Modal)({
  "& .MuiBackdrop-root": {
    backgroundColor: "var(--ht-regular-modal-bgcl)",
  },
})
