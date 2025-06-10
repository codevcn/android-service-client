import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import { RouteGuard } from "./ResourceGuard"
import { useEffect, useRef } from "react"
import { FixedLoading } from "./Loadings"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AppSnackbar } from "./Snackbar"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import { EventSourceContext } from "../lib/event-source-context"

dayjs.extend(isoWeek)
dayjs().isoWeek()
dayjs().isoWeekday()
dayjs().isoWeekYear()

const nonGuardRoutes: string[] = ["/", "/login", "/register", "/faq"]

export default function Layout() {
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!eventSourceRef.current) {
      eventSourceRef.current = new EventSource(
        `${import.meta.env.VITE_API_ENDPOINT_PREFIX}/notifications/stream`,
        { withCredentials: true },
      )
      eventSourceRef.current.addEventListener("error", () => {
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
          eventSourceRef.current = null
        }
      })
    }
    const handleDisableModalBehavior = (e: FocusEvent) => {
      const target = e.target
      if (target && target instanceof HTMLElement && target.closest) {
        if (
          target.closest(
            ".tox-tinymce, .tox-tinymce-aux, .moxman-window, .tam-assetmanager-root",
          ) !== null
        ) {
          e.stopImmediatePropagation()
        }
      }
    }
    document.addEventListener("focusin", handleDisableModalBehavior)
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      document.removeEventListener("focusin", handleDisableModalBehavior)
    }
  }, [])

  return (
    <div className="h-full text-sm">
      <FixedLoading />
      <RouteGuard nonGuardRoutes={nonGuardRoutes}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <EventSourceContext.Provider value={eventSourceRef}>
            <Outlet />
          </EventSourceContext.Provider>
        </LocalizationProvider>
      </RouteGuard>
      <ToastContainer
        position="top-right"
        autoClose={5000} // Đóng sau 5 giây
        hideProgressBar={false} // Hiển thị thanh tiến trình
        newestOnTop={true} // Sắp xếp thông báo mới lên trên
        closeOnClick
        rtl={false} // Hỗ trợ ngôn ngữ RTL
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <AppSnackbar />
    </div>
  )
}
