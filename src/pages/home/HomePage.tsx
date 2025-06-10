import { AppLogo } from "../../components/AppLogo"
import { useState } from "react"
import { SwipeableSlider } from "../../components/Slider"
import HeroBackgroundImg from "../../assets/home-page-hero-background.jpg"
import KanbanStyleImg from "../../assets/home-page-features-Kanban-style.webp"
import DragDropImg from "../../assets/home-page-features-drag-drop.webp"
import FacebookIcon from "@mui/icons-material/Facebook"
import InstagramIcon from "@mui/icons-material/Instagram"
import YouTubeIcon from "@mui/icons-material/YouTube"
import XIcon from "@mui/icons-material/X"
import { Tooltip } from "@mui/material"
import { NavLink } from "react-router-dom"
import { useAuth } from "../../hooks/auth"
import { useAppSelector } from "../../hooks/redux"
import AccountBoxIcon from "@mui/icons-material/AccountBox"
import WorkIcon from "@mui/icons-material/Work"

const Header = () => {
   const { userData } = useAppSelector(({ user }) => user)

   return (
      <header className="sticky top-0 z-50 mx-auto px-10 py-2 flex justify-between items-center bg-white shadow h-[52px]">
         <div className="flex items-center gap-10">
            <a href="/" className="flex items-center">
               <div className="p-1 rounded-sm bg-regular-dark-blue-cl">
                  <AppLogo height={25} width={25} barWidth={5} barSpacing={5} color="white" />
               </div>
               <span className="ml-2 text-2xl font-bold text-black">HeyTask</span>
            </a>
            <nav className="flex space-x-4">
               <a className="text-gray-700 hover:text-regular-dark-blue-cl" href="#">
                  About Us
               </a>
            </nav>
         </div>
         {userData ? (
            <NavLink
               to="/profile"
               className="flex items-center gap-2 text-base bg-regular-dark-blue-cl hover:bg-hover-dark-blue-cl text-white px-4 py-1.5 rounded"
            >
               <AccountBoxIcon />
               <span>Profile</span>
            </NavLink>
         ) : (
            <div className="flex items-center gap-2">
               <NavLink to="/login" className="text-gray-700 hover:text-regular-dark-blue-cl">
                  Log in
               </NavLink>
               <NavLink
                  to="/register"
                  className="bg-regular-dark-blue-cl text-white px-4 py-1.5 rounded"
               >
                  Get started for free
               </NavLink>
            </div>
         )}
      </header>
   )
}

const HeroSection = () => {
   const { userData } = useAppSelector(({ user }) => user)

   return (
      <section className="w-full mx-auto px-10 flex flex-col md:flex-row items-center bg-[#F4F5F7]">
         <div className="md:w-1/2 py-14">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
               Capture, organize, and tackle your to-dos from anywhere.
            </h1>
            <p className="text-lg text-gray-700 mb-8">
               Escape the clutter and chaos—unleash your productivity with HeyTask.
            </p>
            {userData ? (
               <div>
                  <NavLink
                     to="/workspace"
                     className="flex items-center gap-2 bg-regular-dark-blue-cl hover:bg-hover-dark-blue-cl text-white px-4 py-2 rounded w-fit"
                  >
                     <WorkIcon fontSize="small" />
                     <span>Go to your workspace</span>
                  </NavLink>
               </div>
            ) : (
               <div className="flex items-center space-x-2 mb-4">
                  <NavLink
                     to="/login"
                     className="bg-regular-dark-blue-cl text-white px-4 py-2 rounded"
                  >
                     Had an account? Login!
                  </NavLink>
                  <NavLink
                     to="register"
                     className="bg-regular-dark-blue-cl text-white px-4 py-2 rounded"
                  >
                     Sign up - it's free!
                  </NavLink>
               </div>
            )}
         </div>
         <div className="md:w-1/2 pt-14 flex justify-center">
            <div className="relative">
               <img src={HeroBackgroundImg} alt="Hero background" />
            </div>
         </div>
      </section>
   )
}

type TFeatures = "kanban-style" | "drag-and-drop" | "notifications"

const FeaturesSection = () => {
   const [picked, setPicked] = useState<TFeatures>("kanban-style")

   const getControlleredIndex = () => {
      switch (picked) {
         case "kanban-style":
            return 0
         case "drag-and-drop":
            return 1
      }
      return 2
   }

   return (
      <section className="w-full mx-auto px-10 py-8">
         <h1 className="text-4xl font-bold text-gray-900 mb-4">Your productivity powerhouse</h1>
         <p className="text-lg text-gray-600 mb-8">
            Stay organized and efficient with Inbox, Boards, and Planner. Every to-do, idea, or
            responsibility—no matter how small—finds its place, keeping you at the top of your game.
         </p>
         <div className="flex gap-10">
            <div className="space-y-5 flex-1">
               <div className="w-full px-4 mb-8">
                  <button
                     onClick={() => setPicked("kanban-style")}
                     className={`${picked === "kanban-style" ? "shadow-lg border-[#00C7E5]" : "border-transparent"} hover:shadow-lg border-l-8 text-left bg-white rounded-lg p-6`}
                  >
                     <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                        Kanban-style task management
                     </h2>
                     <p className="text-gray-600">
                        HeyTask uses boards, lists, and cards to help users visualize tasks and
                        workflow easily.
                     </p>
                  </button>
               </div>
               <div className="w-full px-4 mb-8">
                  <button
                     onClick={() => setPicked("drag-and-drop")}
                     className={`${picked === "drag-and-drop" ? "shadow-lg border-[#00C7E5]" : "border-transparent"} hover:shadow-lg border-l-8 text-left bg-white rounded-lg p-6`}
                  >
                     <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Flexible drag-and-drop functionality
                     </h2>
                     <p className="text-gray-600">
                        Users can move cards between lists to update task status quickly and
                        efficiently.
                     </p>
                  </button>
               </div>
               <div className="w-full px-4 mb-8">
                  <button
                     onClick={() => setPicked("notifications")}
                     className={`${picked === "notifications" ? "shadow-lg border-[#00C7E5]" : "border-transparent"} hover:shadow-lg border-l-8 text-left bg-white rounded-lg p-6`}
                  >
                     <h2 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
                        Smart notifications
                     </h2>
                     <p className="text-gray-600">
                        Stay updated with real-time notifications about task updates, deadlines, and
                        team activities to never miss important changes.
                     </p>
                  </button>
               </div>
            </div>
            <div className="flex-1">
               <SwipeableSlider
                  slides={[
                     <div className="w-full h-auto flex-shrink-0" key="kanban-style">
                        <img src={KanbanStyleImg} alt="Kanban-style" />
                     </div>,
                     <div className="w-full h-auto flex-shrink-0" key="drag-drop">
                        <img src={DragDropImg} alt="Drag and drop" />
                     </div>,
                  ]}
                  spacing={5}
                  controlleredIndex={getControlleredIndex()}
               />
            </div>
         </div>
      </section>
   )
}

const FooterSection = () => {
   return (
      <footer className="bg-[#172B4D] text-white w-full mx-auto px-4">
         <div className="flex justify-between items-center border-t border-regular-border-cl py-4">
            <div className="flex gap-2 items-center">
               <div className="p-1 bg-white rounded-sm">
                  <AppLogo color="black" />
               </div>
               <h3 className="font-bold text-base leading-none">HeyTask</h3>
            </div>
            <div className="flex space-x-4 text-sm">
               <span>Copyright © 2024 CodeVCN</span>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
               <Tooltip title="Facebook">
                  <a className="text-white hover:text-gray-400" href="#">
                     <FacebookIcon fontSize="small" />
                  </a>
               </Tooltip>
               <Tooltip title="Facebook">
                  <a className="text-white hover:text-gray-400" href="#">
                     <InstagramIcon fontSize="small" />
                  </a>
               </Tooltip>
               <Tooltip title="Facebook">
                  <a className="text-white hover:text-gray-400" href="#">
                     <YouTubeIcon fontSize="small" />
                  </a>
               </Tooltip>
               <Tooltip title="Facebook">
                  <a className="text-white hover:text-gray-400" href="#">
                     <XIcon fontSize="small" />
                  </a>
               </Tooltip>
            </div>
         </div>
      </footer>
   )
}

const HomePage = () => {
   useAuth()

   return (
      <>
         <Header />
         <div className="bg-blue-100 text-center py-2 px-10">
            <span className="text-sm text-regular-dark-blue-cl">
               HeyTask - A visually intuitive, flexible, and easy-to-use tool that helps you
               organize work, collaborate with your team, and complete projects efficiently!
            </span>
         </div>
         <HeroSection />
         <FeaturesSection />
         <FooterSection />
      </>
   )
}

export default HomePage
