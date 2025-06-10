import { NavLink } from "react-router-dom"
import authBgLeft from "../assets/trello-left.4f52d13c.svg"
import authBgRight from "../assets/trello-right.e6e102c7.svg"

export default function Page404() {
  return (
    <section className="relative z-10 bg-transparent w-full min-h-screen">
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
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <h1 className="text-9xl font-bold text-[#065AD4] mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-[#44546f] mb-6">Oops! Page not found</h2>
          <p className="text-[#44546f] mb-8 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, or is
            temporarily unavailable.
          </p>
          <NavLink
            to="/"
            className="inline-flex items-center px-6 py-3 text-white bg-[#065AD4] rounded-md hover:bg-[#0055CC] transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </NavLink>
        </div>
      </div>
    </section>
  )
}
