import authBgLeft from "../../assets/trello-left.4f52d13c.svg"
import authBgRight from "../../assets/trello-right.e6e102c7.svg"
import { TextField, Button, IconButton, CircularProgress } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import { useState } from "react"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"
import { NavLink } from "react-router-dom"
import { authService } from "../../services/auth-service"
import { useForm } from "react-hook-form"
import validator from "validator"
import { pureNavigator } from "../../utils/helpers"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { passwordRegex } from "../../utils/regex"
import { OAuth } from "./OAuth"
import { AppLogo } from "../../components/AppLogo"

type TRegisterFormData = {
  fullname: string
  email: string
  password: string
  reTypePassword: string
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TRegisterFormData>()

  const validateForm = (data: TRegisterFormData): boolean => {
    let isValid: boolean = true
    if (!data.fullname) {
      setError("fullname", { message: "Trường tên đầy đủ không được để trống." })
      isValid = false
    }
    if (!validator.isEmail(data.email)) {
      setError("email", { message: "Email không hợp lệ." })
      isValid = false
    }
    if (!passwordRegex.test(data.password)) {
      setError("password", {
        message: "Mật khẩu phải có ít nhất 4 kí tự, 1 chữ viết thường và 1 số.",
      })
      isValid = false
    }
    if (data.reTypePassword) {
      if (data.reTypePassword !== data.password) {
        setError("reTypePassword", {
          message: "Mật khẩu nhập lại không khớp.",
        })
        isValid = false
      }
    } else {
      setError("reTypePassword", { message: "Trường nhập lại mật khẩu không được để trống." })
      isValid = false
    }
    return isValid
  }

  const registerHandler = (data: TRegisterFormData) => {
    if (validateForm(data)) {
      setLoading(true)
      authService
        .register(data)
        .then(() => {
          pureNavigator("/workspace")
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

  return (
    <div className="relative z-[1] bg-transparent w-full min-h-screen py-12">
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
        <span className="font-semibold leading-tight mt-5 text-center">
          <span>Chào mừng bạn đến với HeyTask.</span>
          <br />
          <span>
            Trước hết hãy đăng ký một tài khoản trên HeyTask để sử dụng dịch vụ của chúng tôi.
          </span>
        </span>
        <form onSubmit={handleSubmit(registerHandler)} className="w-full">
          <div className="w-full mt-6">
            <TextField
              variant="outlined"
              size="small"
              label="Nhập tên đầy đủ của bạn..."
              fullWidth
              {...register("fullname")}
              error={!!errors.fullname}
              helperText={errors.fullname?.message || ""}
            />
          </div>
          <div className="w-full mt-3">
            <TextField
              variant="outlined"
              size="small"
              label="Nhập email của bạn..."
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message || ""}
            />
          </div>
          <div className="w-full mt-3 relative">
            <TextField
              variant="outlined"
              size="small"
              label="Nhập mật khẩu của bạn..."
              fullWidth
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message || ""}
            />
            <div onClick={handleShowPassword} className="absolute top-[1px] right-0">
              <IconButton>{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton>
            </div>
          </div>
          <div className="w-full mt-3 relative">
            <TextField
              variant="outlined"
              size="small"
              label="Nhập lại mật khẩu của bạn..."
              fullWidth
              type={showPassword ? "text" : "password"}
              {...register("reTypePassword")}
              error={!!errors.reTypePassword}
              helperText={errors.reTypePassword?.message || ""}
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
              <span>Đăng ký</span>
            )}
          </Button>
        </form>
        <OAuth />
        <div className="flex gap-x-[5px] mt-5">
          <span>Bạn đã có tài khoản?</span>
          <NavLink to="/login" className="font-bold text-yellow-700 hover:underline">
            Đăng nhập
          </NavLink>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
