import { useState } from "react"
import { userService } from "../../services/user-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { passwordRegex } from "../../utils/regex"
import VisibilityIcon from "@mui/icons-material/Visibility"
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff"
import { LogoLoading } from "../../components/Loadings"
import { ErrorSection } from "./InfoSection"

type TPasswordError = Partial<{
  currentPassword: string
  newPasswword: string
}>

export const PasswordSection = () => {
  const [error, setError] = useState<TPasswordError>({})
  const [showPassword, setShowPassword] = useState<boolean>()
  const [loading, setLoading] = useState<boolean>(false)

  const validate = (currentPassword: string, newPasswword: string): boolean => {
    let isValid: boolean = true
    if (!currentPassword) {
      setError((pre) => ({ ...pre, currentPassword: "Current password must not be empty!" }))
      isValid = false
    }
    if (newPasswword) {
      if (!passwordRegex.test(newPasswword)) {
        setError((pre) => ({
          ...pre,
          newPasswword: "New password must be at least four characters, one letter and one number!",
        }))
        isValid = false
      }
    } else {
      setError((pre) => ({ ...pre, newPasswword: "New password must not be empty!" }))
      isValid = false
    }
    return isValid
  }

  const updatePasswordHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    if (validate(currentPassword, newPassword)) {
      setLoading(true)
      userService
        .updatePassword(currentPassword, newPassword)
        .then(() => {
          toast.success("Update password successfully!")
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  const handleShowPaswword = () => {
    setShowPassword((pre) => !pre)
  }

  return (
    <section className="w-full p-6 rounded-lg shadow-md">
      <h2 className="text-lg leading-5 font-semibold">Password</h2>
      <hr className="my-4" />
      <form onSubmit={updatePasswordHandler} className="space-y-7">
        <div className="flex justify-between items-center">
          <div className="w-fit">
            <label className="block text-sm">Current password</label>
            <div className="relative w-fit">
              <input
                className="text-base bg-regular-bgcl px-4 py-2 pr-12 rounded min-w-32 hover:bg-hover-silver-bgcl focus:bg-hover-silver-bgcl"
                placeholder="Enter your password here..."
                name="currentPassword"
                type={showPassword ? "text" : "password"}
              />
              <button
                onClick={handleShowPaswword}
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-3"
              >
                <VisibilityIcon
                  fontSize="small"
                  sx={{ display: showPassword ? "inline-block" : "none" }}
                />
                <VisibilityOffIcon
                  fontSize="small"
                  sx={{ display: showPassword ? "none" : "inline-block" }}
                />
              </button>
            </div>
            <ErrorSection error={error["currentPassword"]} />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="w-fit">
            <label className="block text-sm">New password</label>
            <div className="relative w-fit">
              <input
                className="text-base bg-regular-bgcl px-4 py-2 pr-12 rounded min-w-32 hover:bg-hover-silver-bgcl focus:bg-hover-silver-bgcl"
                placeholder="Enter your password here..."
                name="newPassword"
                type={showPassword ? "text" : "password"}
              />
              <button
                onClick={handleShowPaswword}
                type="button"
                className="absolute top-1/2 -translate-y-1/2 right-3"
              >
                <VisibilityIcon
                  fontSize="small"
                  sx={{ display: showPassword ? "inline-block" : "none" }}
                />
                <VisibilityOffIcon
                  fontSize="small"
                  sx={{ display: showPassword ? "none" : "inline-block" }}
                />
              </button>
            </div>
            <ErrorSection error={error["newPasswword"]} />
          </div>
        </div>
        <button
          type="submit"
          className="py-2 px-4 rounded font-bold text-sm bg-confirm-btn-bgcl hover:bg-confirm-btn-hover-bgcl text-black"
        >
          {loading ? (
            <div className="flex text-inherit h-5">
              <LogoLoading color="black" size="small" className="m-auto" />
            </div>
          ) : (
            <span>Save changes</span>
          )}
        </button>
      </form>
    </section>
  )
}
