import { Avatar, Dialog, styled, Slider } from "@mui/material"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import { useCallback, useEffect, useRef, useState } from "react"
import { userService } from "../../services/user-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import Cropper from "react-easy-crop"
import type { Point, Area } from "react-easy-crop"
import { getCroppedImg } from "../../utils/helpers"
import { useAppDispatch } from "../../hooks/redux"
import { updateUserData } from "../../redux/user/user-slice"
import { LogoLoading } from "../../components/Loadings"
import uploadIcon from "../../assets/upload-icon.svg"

type TAvatarPreviewSectionProps = {
  avatarURL: string
  onCropComplete: (croppedAreaPixels: Area) => void
}

const AvatarPreview = ({ avatarURL, onCropComplete }: TAvatarPreviewSectionProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  const handleCropComplete = useCallback(
    (_: any, croppedAreaPixels: Area) => {
      onCropComplete(croppedAreaPixels)
    },
    [onCropComplete],
  )

  const zooming = (_: Event, zoomValue: number | number[]) => {
    setZoom(zoomValue as number)
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* <div className="w-72 h-72 relative">
        <Cropper
          image={avatarURL}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
        />
      </div>
      <div className="flex items-center gap-5 w-72 mt-5 text-confirm-btn-bgcl">
        <Slider
          value={zoom}
          shiftStep={1}
          step={0.1}
          marks
          min={1}
          max={3}
          onChange={zooming}
          sx={{ color: "inherit" }}
        />
      </div> */}
      <img src={avatarURL} alt="User Avatar" className="h-full w-full object-cover" />
    </div>
  )
}

type TAvatarSectionProps = {
  originalAvatar: string | null
  fullName: string
}

export const AvatarSection = ({ originalAvatar, fullName }: TAvatarSectionProps) => {
  const [openUploadAvatar, setOpenUploadAvatar] = useState<boolean>(false)
  const [imgPreview, setImgPreview] = useState<string>()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const croppedAvatarRef = useRef<Area>()
  const dispatch = useAppDispatch()

  const handleCropComplete = (croppedAreaPixels: Area) => {
    croppedAvatarRef.current = croppedAreaPixels
  }

  const handleDropImage = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    const image = e.dataTransfer.files?.[0]
    if (image) {
      setImgPreview(URL.createObjectURL(image))
    }
  }

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0]
    if (image) {
      if (imgPreview) URL.revokeObjectURL(imgPreview)
      setImgPreview(URL.createObjectURL(image))
    }
  }

  const uploadUserAvatar = (avatar: File) => {
    userService
      .uploadAvatar(avatar)
      .then((res) => {
        const { imageURL } = res
        userService
          .updateProfile({ avatar: imageURL })
          .then(() => {
            toast.success("Update user avatar successfully!")
            dispatch(updateUserData({ avatar: imageURL }))
          })
          .catch((error) => {
            toast.error(axiosErrorHandler.handleHttpError(error).message)
          })
          .finally(() => {
            setLoading(false)
          })
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
        setLoading(false)
      })
  }

  const updateUserAvatarHandler = () => {
    // if (imgPreview) {
    //   setLoading(true)
    //   const croppedPixels = croppedAvatarRef.current
    //   if (croppedPixels) {
    //     getCroppedImg(imgPreview, croppedPixels)
    //       .then((img) => {
    //         if (img) {
    //           uploadUserAvatar(img)
    //         }
    //       })
    //       .catch((error) => {
    //         toast.error(axiosErrorHandler.handleHttpError(error).message)
    //       })
    //   } else {
    //     const img = avatarInputRef.current?.files?.[0]
    //     if (img) {
    //       uploadUserAvatar(img)
    //     }
    //   }
    // }
    const avatarFile = avatarInputRef.current?.files?.[0]
    if (avatarFile) {
      uploadUserAvatar(avatarFile)
    }
  }

  const closeUpdateAvatarSection = () => {
    const avtarInputEle = avatarInputRef.current
    if (avtarInputEle) {
      avtarInputEle.value = ""
    }
    setOpenUploadAvatar(false)
    setImgPreview(undefined)
  }

  useEffect(() => {
    return () => {
      if (imgPreview) URL.revokeObjectURL(imgPreview)
    }
  }, [imgPreview])

  return (
    <section className="rounded-lg shadow-lg p-6 w-full max-w-2xl">
      <h2 className="text-lg font-semibold mb-2 text-regular-text-cl">
        Profile photo and header image
      </h2>
      <div
        style={{
          backgroundImage:
            "linear-gradient(to bottom, var(--ht-purple-from-ligr), var(--ht-pink-to-ligr))",
        }}
        className="flex w-full h-32 rounded-t-lg bg-cover bg-center"
      >
        <button className="group/root relative m-auto" onClick={() => setOpenUploadAvatar(true)}>
          {originalAvatar ? (
            <Avatar
              alt="User Avatar"
              className="w-24 h-24 rounded-full border-2 border-white"
              src={originalAvatar}
              sx={{ height: 96, width: 96 }}
            >
              {fullName[0]}
            </Avatar>
          ) : (
            <Avatar sx={{ height: 96, width: 96 }}>{fullName[0]}</Avatar>
          )}
          <div className="hidden group-hover/root:flex absolute inset-0 items-center justify-center text-white bg-fade-layer-bgcl rounded-full">
            <CameraAltIcon sx={{ height: 30, width: 30 }} color="inherit" />
          </div>
        </button>
      </div>

      <UpdateAvatarSection
        maxWidth="xs"
        fullWidth
        open={openUploadAvatar}
        onClose={closeUpdateAvatarSection}
        id="STYLE-avatar-upload-modal"
        classes={{ paper: "css-styled-vt-scrollbar" }}
      >
        <div className="p-6 rounded-lg shadow-md text-center text-regular-text-cl relative">
          {loading && (
            <div className="flex absolute inset-0 z-20 bg-regular-modal-bgcl">
              <LogoLoading className="m-auto" />
            </div>
          )}
          <h1 className="text-xl font-semibold mb-6">Change profile photo</h1>
          <input
            id="user-avatar-input"
            type="file"
            accept="image/*"
            hidden
            ref={avatarInputRef}
            onChange={pickImage}
          />
          {imgPreview ? (
            <AvatarPreview avatarURL={imgPreview} onCropComplete={handleCropComplete} />
          ) : (
            <>
              <label
                onDrop={handleDropImage}
                onDragOver={(e) => e.preventDefault()}
                htmlFor="user-avatar-input"
                className="flex flex-col items-center justify-center gap-3 w-52 h-52 p-5 mx-auto mb-4 border-2 border-dashed border-regular-text-cl rounded-full"
              >
                <img src={uploadIcon} alt="Upload Icon" height={78} width={78} />
                <p className="text-gray-500">Drag and drop your image here</p>
              </label>
              <p className="text-gray-500 mb-4">or</p>
              <label
                htmlFor="user-avatar-input"
                className="bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl cursor-pointer text-regular-text-cl py-2 px-4 rounded"
              >
                Upload a photo
              </label>
            </>
          )}
          <div className="flex justify-end gap-2 mt-8">
            <button
              onClick={closeUpdateAvatarSection}
              className="bg-delete-btn-bgcl hover:bg-delete-btn-hover-bgcl text-black py-1.5 px-4 rounded font-bold"
            >
              Cancel
            </button>
            <button
              onClick={updateUserAvatarHandler}
              className={`${imgPreview ? "hover:bg-confirm-btn-hover-bgcl" : "cursor-no-drop opacity-50"} flex gap-2 items-center bg-confirm-btn-bgcl text-black py-1.5 px-4 rounded font-bold`}
            >
              <CloudUploadIcon fontSize="small" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      </UpdateAvatarSection>
    </section>
  )
}

const UpdateAvatarSection = styled(Dialog)({
  "& .MuiPaper-root": {
    backgroundColor: "var(--ht-modal-board-bgcl)",
  },
})
