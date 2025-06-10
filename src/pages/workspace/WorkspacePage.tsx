import { TopNavigation } from "../TopNavigation"
import ReorderIcon from "@mui/icons-material/Reorder"
import { Projects } from "./Projects"
import { NavLink } from "react-router-dom"
import { useUser } from "../../hooks/user"
import { Avatar } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import BarChartIcon from "@mui/icons-material/BarChart"
import { useRef } from "react"
import { Statistics } from "./Statistics"

const UserSection = () => {
  const user = useUser()!
  const { avatar, fullName } = user

  return (
    <section className="max-w-4xl px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-[#454F59]">
          {avatar ? (
            <Avatar alt="User Avatar" src={avatar} sx={{ height: 60, width: 60 }} />
          ) : (
            <Avatar sx={{ height: 60, width: 60 }}>{fullName[0]}</Avatar>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <NavLink
            to="/profile"
            className="group/root flex items-center gap-x-1 text-regular-text-cl"
          >
            <EditIcon sx={{ height: 16, width: 16 }} />
            <span className="text-base group-hover/root:underline">Edit</span>
          </NavLink>
        </div>
      </div>
      <p className="text-regular-text-cl mt-3">{`This is ${fullName}'s workspace`}</p>
    </section>
  )
}

type TSideNavProps = {
  onSwitchTab: (style: TTab) => void
}

const SideNav = ({ onSwitchTab }: TSideNavProps) => {
  return (
    <section className="text-regular-text-cl w-[180px]">
      <div
        className="flex items-center gap-2 w-full rounded px-2 py-1 mb-2 hover:bg-hover-silver-bgcl cursor-pointer"
        onClick={() => onSwitchTab("STYLE-projects")}
      >
        <ReorderIcon />
        <span>Projects</span>
      </div>
      <div
        className="flex items-center gap-2 w-full rounded px-2 py-1 mb-2 hover:bg-hover-silver-bgcl cursor-pointer"
        onClick={() => onSwitchTab("STYLE-statistics")}
      >
        <BarChartIcon />
        <span>Statistics</span>
      </div>
    </section>
  )
}

const tabClasses = ["STYLE-projects", "STYLE-statistics"] as const

type TTab = (typeof tabClasses)[number]

const WorkspacePage = () => {
  const switchTabRef = useRef<HTMLDivElement>(null)

  const handleSwitchTab = (style: TTab) => {
    const switchTabEle = switchTabRef.current
    if (switchTabEle) {
      switchTabEle.classList.remove(...tabClasses)
      switchTabEle.classList.add(style)
    }
  }

  return (
    <div className="bg-regular-bgcl min-h-screen">
      <TopNavigation />
      <div className="px-5 lg:px-10 pb-10 mt-8">
        <h2 className="text-xl font-bold text-regular-text-cl">Workspace</h2>
        <hr className="mb-5 mt-3" />
        <div className="flex gap-5 lg:gap-10">
          <SideNav onSwitchTab={handleSwitchTab} />
          <section
            ref={switchTabRef}
            id="STYLE-switch-tab"
            className="STYLE-projects text-regular-text-cl grow"
          >
            <section className={`${tabClasses[0]} hidden w-full`}>
              <UserSection />
              <hr className="my-4" />
              <Projects />
            </section>
            <section className={`${tabClasses[1]} hidden w-full`}>
              <Statistics />
            </section>
          </section>
        </div>
      </div>
    </div>
  )
}

export default WorkspacePage
