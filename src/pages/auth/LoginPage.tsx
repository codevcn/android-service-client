import authBgLeft from "../../assets/trello-left.4f52d13c.svg"
import authBgRight from "../../assets/trello-right.e6e102c7.svg"
import { TextField, Button, IconButton, CircularProgress } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import { useState } from "react"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { NavLink, useSearchParams } from "react-router-dom"
import { authService } from "../../services/auth-service"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { OAuth } from "./OAuth"
import { AppLogo } from "../../components/AppLogo"
import { pureNavigator } from "../../utils/helpers"

type TFormData = {
  email: string
  password: string
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<TFormData>()
  const [searchParams] = useSearchParams()

  const validateForm = (data: TFormData): boolean => {
    let isValid: boolean = true
    if (!data.email) {
      setError("email", { message: "Email không được bỏ trống." })
      isValid = false
    }
    if (!data.password) {
      setError("password", {
        message: "Mật khẩu không được bỏ trống.",
      })
      isValid = false
    }
    return isValid
  }

  const loginHandler = (data: TFormData) => {
    if (validateForm(data)) {
      setLoading(true)
      authService
        .login(data)
        .then(() => {
          pureNavigator(searchParams.get("redirect") || "/workspace")
        })
        .catch((error) => {
          toast.error(axiosErrorHandler.handleHttpError(error).message)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  const handleShowPassword = () => {
    setShowPassword((pre) => !pre)
  }

  const handleFillingInput = (field: keyof TFormData) => {
    clearErrors(field)
  }

  return (
    <section className="relative z-10 bg-transparent w-full min-h-screen py-12">
      <div
        style={{
          backgroundImage: `url(${authBgLeft}), url(${authBgRight})`,
          backgroundRepeat: "no-repeat, no-repeat",
          backgroundAttachment: "fixed, fixed",
          backgroundSize: "368px, 368px",
          backgroundPosition: "left bottom, right bottom",
        }}
        className="flex bg-[#fafbfc] absolute w-full h-full -z-[1] top-0 left-0"
      ></div>
      <div className="flex flex-col items-center w-[400px] py-[32px] px-[40px] rounded bg-white m-auto shadow-md text-[#44546f]">
        <NavLink to="/" className="flex gap-x-2 items-center text-black">
          <div className="p-1 rounded-sm bg-[#065AD4]">
            <AppLogo height={25} width={25} barWidth={5} barSpacing={5} color="white" />
          </div>
          <span className="text-[2rem] font-bold">HeyTask</span>
        </NavLink>
        <span className="font-semibold mt-5">Login to continue.</span>
        <form action="#" onSubmit={handleSubmit(loginHandler)} className="w-full">
          <div className="w-full mt-6">
            <TextField
              variant="outlined"
              size="small"
              label="Enter your email..."
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message || ""}
              onFocus={() => handleFillingInput("email")}
            />
          </div>
          <div className="w-full mt-3 relative">
            <TextField
              variant="outlined"
              size="small"
              label="Enter your password..."
              fullWidth
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message || ""}
              onFocus={() => handleFillingInput("password")}
            />
            <div onClick={handleShowPassword} className="absolute top-[1px] right-0">
              <IconButton>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton>
            </div>
          </div>
          <Button
            sx={{ marginTop: "20px", fontWeight: "bold", color: "white" }}
            variant="contained"
            size="medium"
            fullWidth
            {...(loading ? {} : { endIcon: <SendIcon /> })}
            type="submit"
          >
            {loading ? (
              <CircularProgress thickness={5} size={24.5} color="inherit" />
            ) : (
              <span>Login</span>
            )}
          </Button>
        </form>
        <OAuth />
        <div className="flex gap-x-[5px] mt-5">
          <span>You haven't had an account?</span>
          <NavLink to="/register" className="font-bold text-yellow-700 hover:underline">
            Register
          </NavLink>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
