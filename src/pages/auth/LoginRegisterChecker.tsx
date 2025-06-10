import authBgLeft from "../../assets/trello-left.4f52d13c.svg"
import authBgRight from "../../assets/trello-right.e6e102c7.svg"
import { NavLink, useNavigate } from "react-router-dom"
import { AppLogo } from "../../components/AppLogo"
import { Avatar } from "@mui/material"
import { useAuth } from "../../hooks/auth"
import { useUser } from "../../hooks/user"
import { EAuthStatus } from "../../utils/enums"
import type { TUserData } from "../../services/types"
import { authService } from "../../services/auth-service"
import { pureNavigator } from "../../utils/helpers"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { useState } from "react"
import { LogoLoading } from "../../components/Loadings"

type TLogoutSectionProps = {
  userData: TUserData
}

const LogoutSection = ({ userData }: TLogoutSectionProps) => {
  const { avatar, fullName, email } = userData
  const navigate = useNavigate()
  const [loading, setLoading] = useState<boolean>(false)

  const goBack = () => {
    navigate(-1)
  }

  const logoutHandler = () => {
    setLoading(true)
    authService
      .logout()
      .then(() => {
        pureNavigator("/")
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        setLoading(false)
      })
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
          <div className="p-1 rounded-sm bg-regular-dark-blue-cl">
            <AppLogo height={25} width={25} barWidth={5} barSpacing={5} color="white" />
          </div>
          <span className="text-[2rem] font-bold">HeyTask</span>
        </NavLink>
        <span className="font-semibold mt-5">Log out of your HayTask account.</span>
        <div className="flex items-center gap-3 mt-7 w-full">
          {avatar ? (
            <Avatar src={avatar} sx={{ height: 72, width: 72 }} />
          ) : (
            <Avatar sx={{ height: 72, width: 72 }}>{fullName[0]}</Avatar>
          )}
          <div className="text-base w-[calc(100%-72px-12px)]">
            <p className="font-bold truncate w-full">{fullName}</p>
            <p>{email}</p>
          </div>
        </div>
        <button
          onClick={logoutHandler}
          className="bg-regular-dark-blue-cl rounded-sm p-2 text-white w-full mt-6 text-base"
        >
          {loading ? (
            <div className="flex h-6">
              <LogoLoading className="m-auto" color="white" />
            </div>
          ) : (
            <span>Log out</span>
          )}
        </button>
        <div className="mt-2">
          <span>Don't want to log out? </span>
          <span
            onClick={goBack}
            className="text-sm hover:underline text-regular-dark-blue-cl cursor-pointer"
          >
            Go back
          </span>
        </div>
      </div>
    </section>
  )
}

const Checking = () => {
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
        <LogoLoading color="black" />
        <p className="text-base mt-5">Downloading data...</p>
      </div>
    </section>
  )
}

type TAuthCheckerProps = {
  children: React.JSX.Element
}

export const LoginRegisterChecker = ({ children }: TAuthCheckerProps) => {
  const { authStatus } = useAuth()
  const user = useUser()

  if (authStatus === EAuthStatus.IS_AUTHENTICATED && user) return <LogoutSection userData={user} />
  if (authStatus === EAuthStatus.UNAUTHENTICATED) return children
  return <Checking />
}
