import { type MouseEvent, useRef, useState } from "react"
import { Menu, MenuItem, Button, styled, Avatar, Popover } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { useUser } from "../hooks/user"
import { StyledIconButton } from "../components/StyledIconButton"
import LogoutIcon from "@mui/icons-material/Logout"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { Notification } from "./Notification"
import { AppLogo } from "../components/AppLogo"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { GeneralSearch } from "./GeneralSearch"

const MenuList = () => {
  return (
    <div className="flex items-center gap-x-2 text-regular-text-cl">
      <Link
        to="/workspace"
        className="font-bold text-inherit normal-case hover:bg-[var(--ht-hover-silver-bgcl)] p-1.5 rounded"
      >
        Workspace
      </Link>
    </div>
  )
}

const ProfileMenu = () => {
  const user = useUser()!
  const [anchorEle, setAnchorEle] = useState<HTMLButtonElement | null>(null)
  const navigate = useNavigate()

  const handleOpenAddMemberBoard = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  const logout = () => {
    navigate("/login")
  }

  return (
    <>
      <StyledIconButton onClick={handleOpenAddMemberBoard}>
        {user.avatar ? (
          <Avatar src={user.avatar} alt="User Avatar" sx={{ height: 24, width: 24 }}>
            {user.fullName[0]}
          </Avatar>
        ) : (
          <Avatar alt="User Avatar" sx={{ height: 24, width: 24 }}>
            {user.fullName[0]}
          </Avatar>
        )}
      </StyledIconButton>

      <StyledPopover
        open={!!anchorEle}
        anchorEl={anchorEle}
        onClose={() => handleOpenAddMemberBoard()}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <div className="py-3 pt-5 text-regular-text-cl w-[300px]">
          <h2 className="text-sm font-bold px-4 w-full">ACCOUNT</h2>
          <div className="flex items-center gap-x-2 mt-3 px-4 w-full">
            {user.avatar ? (
              <Avatar src={user.avatar} sx={{ height: 40, width: 40 }} />
            ) : (
              <Avatar sx={{ height: 40, width: 40 }}>{user.fullName[0]}</Avatar>
            )}
            <div>
              <p className="font-semibold text-sm">{user.fullName}</p>
              <p className="font-normal text-xs">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 w-full">
            <NavLink
              to="/profile"
              className="flex items-center gap-x-3 justify-between mb-3 w-full px-4 py-1 hover:bg-modal-btn-hover-bgcl"
            >
              <span className="text-sm">Manage account</span>
              <span>
                <OpenInNewIcon fontSize="small" />
              </span>
            </NavLink>
          </div>
          <div className="bg-regular-border-cl h-[1px] w-[90%] mx-auto"></div>
          <div className="mt-3 w-full">
            <button
              onClick={logout}
              className="flex items-center gap-x-3 justify-between w-full px-4 py-1 hover:bg-[#ff2d1f66]"
            >
              <span className="text-sm font-bold">Logout</span>
              <span>
                <LogoutIcon fontSize="small" />
              </span>
            </button>
          </div>
        </div>
      </StyledPopover>
    </>
  )
}

export const TopNavigation = () => {
  return (
    <nav className="flex justify-between gap-x-5 h-top-nav bg-regular-bgcl py-2 px-4 border-b border-divider-cl relative z-30">
      <div className="flex gap-x-5">
        <NavLink to="/" className="flex gap-x-2 items-center text-[#9EACBA] cursor-pointer">
          <div className="p-1 bg-regular-text-cl rounded-sm">
            <AppLogo color="black" />
          </div>
          <span className="text-[1.2rem] font-bold">HeyTask</span>
        </NavLink>
        <MenuList />
      </div>
      <div className="flex items-center gap-x-1">
        <GeneralSearch />
        <Notification />
        <ProfileMenu />
      </div>
    </nav>
  )
}

const StyledButton = styled(Button)({
  className: "font-bold text-inherit normal-case hover:bg-[var(--ht-hover-silver-bgcl)]",
})

const StyledPopover = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 6,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    border: "1px var(--ht-regular-border-cl) solid",
  },
})
