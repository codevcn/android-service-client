import NotificationsIcon from "@mui/icons-material/Notifications"
import { StyledIconButton } from "../components/StyledIconButton"
import {
  Popover,
  styled,
  Fade,
  FormControlLabel,
  Switch,
  Tooltip,
  Badge,
  BadgeProps,
} from "@mui/material"
import { useContext, useEffect, useRef, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import { useAppDispatch, useAppSelector } from "../hooks/redux"
import type { TNotificationData } from "../services/types"
import { LogoLoading } from "../components/Loadings"
import { notificationService } from "../services/notification-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../utils/axios-error-handler"
import {
  addNotifications,
  setFilterResult,
  setNotifications,
  updateManyNotifications,
  updateSingleNotification,
} from "../redux/notification/notification-slice"
import dayjs from "dayjs"
import { openFixedLoadingHandler, sanitizeHTMLString } from "../utils/helpers"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank"
import { ESSEEvents } from "../utils/enums"
import type { TNotificationEventData } from "../utils/types"
import { EApiNotificationAction, EApiNotificationTypes } from "../services/apis/types/output-enums"
import { projectService } from "../services/project-service"
import { EventSourceContext } from "../lib/event-source-context"
import { EInternalEvents, eventEmitter } from "../utils/events"
type TNotificationItemProps = {
  notificationData: TNotificationData
  onMarkAsRead: (notificationId: number, seen: boolean) => void
  loadingId: number[] | undefined
}

const NotificationItem = ({
  notificationData,
  onMarkAsRead,
  loadingId,
}: TNotificationItemProps) => {
  const { timestamp, description, seen, id, type, action } = notificationData
  const dispatch = useAppDispatch()

  const handleAcceptInvitation = () => {
    openFixedLoadingHandler(true)
    projectService
      .acceptProjectInvitation(id)
      .then(() => {
        toast.success("Invitation accepted")
        dispatch(updateSingleNotification({ id, action: EApiNotificationAction.ACCEPT }))
        eventEmitter.emit(EInternalEvents.REFRESH_JOINED_PROJECTS)
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        openFixedLoadingHandler(false)
      })
  }

  const handleRejectInvitation = () => {
    openFixedLoadingHandler(true)
    projectService
      .rejectProjectInvitation(id)
      .then(() => {
        toast.success("Invitation rejected")
        dispatch(updateSingleNotification({ id, action: EApiNotificationAction.REJECT }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        openFixedLoadingHandler(false)
      })
  }

  return (
    <div className="bg-modal-btn-bgcl rounded-lg relative text-sm">
      <div className="py-1 px-2 h-6 bg-black rounded-tr-md rounded-tl-md relative">
        {/* <div className="flex absolute top-1/2 right-2 -translate-y-1/2 z-20">
          {loadingId?.includes(id) ? (
            <LogoLoading size="small" />
          ) : seen ? (
            <Tooltip title="This is read" arrow>
              <div className="flex items-center gap-1 text-regular-text-cl">
                <span className="text-xs">Seen</span>
                <DoneAllIcon sx={{ height: 16, width: 16 }} color="inherit" />
              </div>
            </Tooltip>
          ) : (
            <Tooltip title="Mark as read" arrow>
              <button
                onClick={() => onMarkAsRead(id, !seen)}
                className="h-4 w-4 bg-confirm-btn-bgcl hover:scale-125 rounded-full"
              ></button>
            </Tooltip>
          )}
        </div> */}
        {action === EApiNotificationAction.ACCEPT && (
          <div className="flex absolute top-1/2 right-2 -translate-y-1/2 z-20 items-center gap-1 text-success-text-cl">
            <DoneAllIcon sx={{ height: 16, width: 16 }} color="inherit" />
            <span className="text-xs">Invitation accepted</span>
          </div>
        )}
        {action === EApiNotificationAction.REJECT && (
          <div className="flex absolute top-1/2 right-2 -translate-y-1/2 z-20 items-center gap-1 text-delete-btn-bgcl">
            <CloseIcon sx={{ height: 16, width: 16 }} color="inherit" />
            <span className="text-xs">Invitation rejected</span>
          </div>
        )}
      </div>
      <div className="flex space-x-3 p-2 rounded-br-md rounded-bl-md">
        <div className="text-sm leading-snug space-y-1 whitespace-pre-wrap">
          <div className="text-sm">{sanitizeHTMLString(description)}</div>
          {type === EApiNotificationTypes.PROJECT_INVITATION &&
            action === EApiNotificationAction.PENDING && (
              <div className="flex items-center gap-2 py-1">
                <button
                  onClick={handleAcceptInvitation}
                  className="flex-1 text-xs py-1 px-2 rounded bg-success-text-cl text-black"
                >
                  Accept
                </button>
                <button
                  onClick={handleRejectInvitation}
                  className="flex-1 text-xs py-1 px-2 rounded bg-delete-btn-bgcl text-black"
                >
                  Reject
                </button>
              </div>
            )}
          <div className="text-regular-text-cl text-xs text-right">
            {dayjs(timestamp).format("MMM D, YYYY, h:mm A")}
          </div>
        </div>
      </div>
    </div>
  )
}

type TNotificationsFilter = Partial<{
  onlyShowUnread: boolean
}>

type TIsMore = "is-more" | "no-more"

const NotificationsList = () => {
  const { notifications, filterResult } = useAppSelector(({ notification }) => notification)
  const dispatch = useAppDispatch()
  const [loadingId, setLoadingId] = useState<TNotificationData["id"][]>()
  const filterDataRef = useRef<TNotificationsFilter>({ onlyShowUnread: true })
  const loadMoreTargetRef = useRef<HTMLDivElement>(null)
  const loadMoreObserverRef = useRef<IntersectionObserver>()
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const [isMore, setIsMore] = useState<TIsMore>()
  const [fetching, setFetching] = useState<boolean>()

  const finalNotifications = filterResult || notifications

  const handleMarkAsRead = (notificationId: number, seen: boolean) => {
    setLoadingId([notificationId])
    notificationService
      .updateNotification({ id: notificationId, seen })
      .then(() => {
        dispatch(updateSingleNotification({ id: notificationId, seen }))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        setLoadingId(undefined)
      })
  }

  const handleMarkAllAsRead = () => {
    // đã bỏ
    // setLoadingId(notifications?.map(({ id }) => id))
    // notificationService
    //    .markAllAsRead()
    //    .then(() => {
    //       dispatch(updateManyNotifications({ seen: true }))
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
    //    .finally(() => {
    //       setLoadingId(undefined)
    //    })
  }

  const filterNotifications = (
    notifications: TNotificationData[] | null,
    filterData: TNotificationsFilter,
  ) => {
    if (notifications && notifications.length > 0) {
      setTimeout(() => {
        const result: TNotificationData[] = []
        const { onlyShowUnread } = filterData
        for (const notification of notifications) {
          if (!onlyShowUnread || !notification.seen) {
            result.push(notification)
          }
        }
        dispatch(setFilterResult(result))
      }, 0)
    } else {
      dispatch(setFilterResult(null))
    }
  }

  const onlyShowUnreadNotifications = (e: React.ChangeEvent<HTMLInputElement>) => {
    filterDataRef.current.onlyShowUnread = e.target.checked
    filterNotifications(notifications, filterDataRef.current)
  }

  const fetchNotifications = () => {
    setFetching(true)
    notificationService
      .fetchNotifications()
      .then((res) => {
        const notifications = res.notifications
        setIsMore(notifications.length > 0 ? "is-more" : "no-more")
        dispatch(setNotifications(notifications))
      })
      .catch((error) => {
        toast.error(axiosErrorHandler.handleHttpError(error).message)
      })
      .finally(() => {
        setFetching(false)
      })
  }

  const checkAtLeastOneUnread = (notifications: TNotificationData[]) =>
    notifications.some(({ seen }) => !seen)

  const loadMoreNotifications = () => {
    // đã bỏ
    // if (!loadingMore) {
    //    setLoadingMore(true)
    //    notificationService
    //       .loadMoreNotifications(notifications!.at(-1)!.id)
    //       .then((res) => {
    //          const notifications = res.notifications
    //          setIsMore(notifications.length > 0 ? "is-more" : "no-more")
    //          dispatch(addNotifications(notifications))
    //       })
    //       .catch((error) => {
    //          toast.error(axiosErrorHandler.handleHttpError(error).message)
    //       })
    //       .finally(() => {
    //          setLoadingMore(false)
    //       })
    // }
  }

  const initLoadMoreNotifications = () => {
    if (notifications && notifications.length > 0) {
      loadMoreObserverRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMoreNotifications()
          }
        },
        { threshold: 1.0 },
      )
      const loadMoreTarget = loadMoreTargetRef.current
      if (loadMoreTarget) {
        loadMoreObserverRef.current?.observe(loadMoreTarget)
      }
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    initLoadMoreNotifications()
    return () => {
      loadMoreObserverRef.current?.disconnect()
    }
  }, [notifications, loadingMore, filterResult, fetching])

  useEffect(() => {
    filterNotifications(notifications, filterDataRef.current)
  }, [notifications])

  return !fetching && finalNotifications ? (
    <>
      <div className="text-sm py-2 px-3 w-full">
        <div className="flex items-center gap-3 justify-between">
          {/* <OnlyShowUnreadBtn
            control={<Android12Switch defaultChecked onChange={onlyShowUnreadNotifications} />}
            label="Only show unread"
          /> */}
          {/* {checkAtLeastOneUnread(finalNotifications) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs py-1 px-2 rounded bg-modal-btn-bgcl hover:bg-modal-btn-hover-bgcl"
            >
              Mark all as read
            </button>
          )} */}
        </div>
      </div>
      {finalNotifications.length > 0 ? (
        <div className="css-styled-vt-scrollbar grow overflow-y-auto pb-2 px-3 space-y-3">
          {finalNotifications.map((notification) => (
            <NotificationItem
              onMarkAsRead={handleMarkAsRead}
              key={notification.id}
              notificationData={notification}
              loadingId={loadingId}
            />
          ))}
          <div
            hidden={!(isMore && isMore === "is-more")}
            className="flex justify-center w-full h-5"
          >
            {loadingMore && <LogoLoading size="small" className="m-auto" />}
            <div hidden={loadingMore} ref={loadMoreTargetRef} className="h-full w-full"></div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center grow min-h-[300px] rounded-lg shadow-sm p-6 text-regular-text-cl">
          <CheckBoxOutlineBlankIcon color="inherit" sx={{ height: 35, width: 35 }} />
          <h3 className="text-lg font-medium mt-4">No notifications available</h3>
          <p className="text-sm text-center mt-2">
            You currently have no notifications. Please check back later.
          </p>
        </div>
      )}
    </>
  ) : (
    <div className="flex grow w-full">
      <LogoLoading className="m-auto" />
    </div>
  )
}

type TNotificationButtonProps = {
  onOpenNotificationsList: (e?: React.MouseEvent<HTMLButtonElement>) => void
}

const NotificationButton = ({ onOpenNotificationsList }: TNotificationButtonProps) => {
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    // đã bỏ
    // notificationService
    //    .countUnreadNotifcations()
    //    .then((res) => {
    //       setUnreadCount(res.total)
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
  }, [])

  return (
    <StyledBadge color="error" badgeContent={unreadCount} max={9}>
      <StyledIconButton onClick={onOpenNotificationsList}>
        <NotificationsIcon className="text-white" fontSize="small" />
      </StyledIconButton>
    </StyledBadge>
  )
}

export const Notification = () => {
  const [anchorEle, setAnchorEle] = useState<HTMLElement | null>(null)
  const dispatch = useAppDispatch()
  const eventSource = useContext(EventSourceContext)

  const handleOpenNotification = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      setAnchorEle(e.currentTarget)
    } else {
      setAnchorEle(null)
    }
  }

  useEffect(() => {
    const generalListener = (e: MessageEvent) => {
      const data = JSON.parse(e.data) as TNotificationEventData
      dispatch(
        addNotifications([
          {
            id: data.notificationId,
            description: data.message,
            timestamp: data.createdAt,
            seen: data.read,
            type: data.type,
            action: data.action,
            projectId: data.projectId,
            senderId: data.senderId,
          },
        ]),
      )
    }
    eventSource.current?.addEventListener(ESSEEvents.GENERAL, generalListener)
    return () => {
      eventSource.current?.removeEventListener(ESSEEvents.GENERAL, generalListener)
    }
  }, [])

  return (
    <>
      <NotificationButton onOpenNotificationsList={handleOpenNotification} />

      <NotificationBoard
        anchorEl={anchorEle}
        open={!!anchorEle}
        onClose={() => handleOpenNotification()}
        TransitionComponent={Fade}
        keepMounted
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <div className="kkk-vcn-noti flex flex-col bg-modal-popover-bgcl text-modal-text-cl pt-3 rounded-lg w-full h-full">
          <header className="flex pt-0 pb-3 items-center justify-between px-3 w-full">
            <h3 className="text-regular-text-cl font-semibold text-lg text-center">
              Notifications
            </h3>
            <button
              onClick={() => handleOpenNotification()}
              className="flex h-8 w-8 hover:bg-hover-silver-bgcl rounded"
            >
              <CloseIcon fontSize="small" className="text-regular-text-cl m-auto" />
            </button>
          </header>
          <div className="px-3 w-full">
            <hr />
          </div>
          <NotificationsList />
        </div>
      </NotificationBoard>
    </>
  )
}

const NotificationBoard = styled(Popover)({
  "& .MuiPaper-root": {
    borderRadius: 8,
    backgroundColor: "var(--ht-modal-popover-bgcl)",
    height: "calc(100vh - var(--ht-top-nav-height))",
    width: 380,
    border: "1px var(--ht-regular-border-cl) solid",
    "& .MuiList-root": {
      backgroundColor: "var(--ht-modal-popover-bgcl)",
      borderRadius: 8,
    },
  },
})

const Android12Switch = styled(Switch)({
  padding: 8,
  height: 33,
  width: 50,
  marginLeft: -8,
  "& .MuiSwitch-track": {
    borderRadius: 11,
    backgroundColor: "#9FADBC",
    opacity: 1,
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: "50%",
      width: 14,
      height: 14,
      transform: "scale(0.9) translateY(-50%)",
    },
    "&::before": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 24 24"><path fill="${encodeURIComponent("#000")}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L15,10L16.5,8.5L17.91,7.09L21,7Z"/></svg>')`,
      left: 10,
    },
    "&::after": {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 24 24" fill="${encodeURIComponent("#000")}"><line x1="6" y1="6" x2="18" y2="18" stroke="black" stroke-width="2"/><line x1="6" y1="18" x2="18" y2="6" stroke="black" stroke-width="2"/></svg>')`,
      right: 10,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 12,
    height: 12,
    margin: 2,
    backgroundColor: "black",
  },
  "& .MuiSwitch-switchBase": {
    "&.Mui-checked": {
      transform: "translateX(17px)",
      "& + .MuiSwitch-track": {
        backgroundColor: "var(--ht-success-text-cl)",
        opacity: 1,
      },
    },
  },
})

const OnlyShowUnreadBtn = styled(FormControlLabel)({
  marginLeft: "0",
  "& .MuiFormControlLabel-label": {
    fontSize: "14px",
  },
})

const StyledBadge = styled(Badge)<BadgeProps>({
  "& .MuiBadge-badge": {
    right: 5,
    top: 5,
  },
})
