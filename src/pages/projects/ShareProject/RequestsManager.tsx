import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import { ETabTypes } from "./sharing"
import { useEffect, useState } from "react"
import { projectService } from "../../../services/project-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../../utils/axios-error-handler"
import type { TProjectInvitationData, TProjectRequestData } from "../../../services/types"
import { LogoLoading } from "../../../components/Loadings"
import { Avatar } from "@mui/material"
import { EProjectInvitationStatus, EProjectRequestStatus } from "../../../utils/enums"
import { useAppDispatch, useAppSelector } from "../../../hooks/redux"
import { setRequests, updateRequests } from "../../../redux/project/project-slice"

type TJoinRequestsProps = {
  active: boolean
  projectId: number
}

const SentInvitations = ({ active, projectId }: TJoinRequestsProps) => {
  const [invitations, setInvitations] = useState<TProjectInvitationData[]>()

  useEffect(() => {
    // đã bỏ
    // projectService
    //    .getProjectInvitations(projectId)
    //    .then((res) => {
    //       setInvitations(res)
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
  }, [])

  const convertStatus = (status: EProjectInvitationStatus) => {
    switch (status) {
      case EProjectInvitationStatus.ACCEPTED:
        return "Accepted"
      case EProjectInvitationStatus.DECLINED:
        return "Declined"
    }
    return "Pending"
  }

  const setStatusTextColor = (status: EProjectInvitationStatus) => {
    switch (status) {
      case EProjectInvitationStatus.ACCEPTED:
        return "text-success-text-cl"
      case EProjectInvitationStatus.DECLINED:
        return "text-delete-btn-bgcl"
    }
    return "text-regular-text-cl"
  }

  return (
    <div className="h-full pt-2 pr-1 space-y-1" hidden={!active}>
      {invitations ? (
        invitations.length > 0 ? (
          invitations.map(({ id, receiver: { avatar, fullName, email }, status }) => (
            <div
              key={id}
              className="flex items-center justify-between py-2 px-1 rounded hover:bg-modal-btn-hover-bgcl"
            >
              <div className="flex items-center gap-x-3">
                {avatar ? (
                  <Avatar src={avatar} alt="User Avatar" sx={{ height: 32, width: 32 }} />
                ) : (
                  <Avatar sx={{ height: 32, width: 32 }}>{avatar}</Avatar>
                )}
                <div className="text-sm">
                  <p className="font-medium leading-tight">{fullName}</p>
                  <p className="text-xs leading-tight">{email}</p>
                </div>
              </div>
              <div className={`${setStatusTextColor(status)} text-sm pr-1 font-bold`}>
                {convertStatus(status)}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-2 rounded-full bg-modal-btn-bgcl w-fit">
              <PersonOutlineIcon className="text-modal-text-cl" />
            </div>
            <p className="mt-2 text-sm">There are no invitations were sent.</p>
          </div>
        )
      ) : (
        <div className="flex w-full h-full">
          <LogoLoading className="m-auto" />
        </div>
      )}
    </div>
  )
}

type TSentRequestsProps = {
  active: boolean
  projectId: number
}

const JoinRequests = ({ active, projectId }: TSentRequestsProps) => {
  const { requests } = useAppSelector(({ project }) => project)
  const [loading, setLoading] = useState<TProjectRequestData["id"]>()
  const dispatch = useAppDispatch()

  const fetchRequests = () => {
    // đã bỏ
    // projectService
    //    .getProjectRequests(projectId)
    //    .then((res) => {
    //       dispatch(setRequests(res))
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAcceptDecline = (requestId: number, isAccept: boolean) => {
    // đã bỏ
    // setLoading(requestId)
    // projectService
    //    .acceptDeclineRequest(requestId, isAccept)
    //    .then(() => {
    //       dispatch(
    //          updateRequests([
    //             {
    //                id: requestId,
    //                status: isAccept
    //                   ? EProjectRequestStatus.ACCEPTED
    //                   : EProjectRequestStatus.DECLINED,
    //             },
    //          ]),
    //       )
    //    })
    //    .catch((error) => {
    //       toast.error(axiosErrorHandler.handleHttpError(error).message)
    //    })
    //    .finally(() => {
    //       setLoading(undefined)
    //    })
  }

  const convertStatus = (status: EProjectRequestStatus) => {
    switch (status) {
      case EProjectRequestStatus.ACCEPTED:
        return "Accepted"
      case EProjectRequestStatus.DECLINED:
        return "Declined"
    }
    return "Pending"
  }

  const setStatusTextColor = (status: EProjectRequestStatus) => {
    switch (status) {
      case EProjectRequestStatus.ACCEPTED:
        return "text-success-text-cl"
      case EProjectRequestStatus.DECLINED:
        return "text-delete-btn-bgcl"
    }
    return "text-regular-text-cl"
  }

  return (
    <div className="h-full pt-2 pr-1 space-y-1" hidden={!active}>
      {requests ? (
        requests.length > 0 ? (
          requests.map(({ id, sender: { avatar, fullName, email }, status }) => (
            <div
              key={id}
              className="flex items-center justify-between py-2 px-1 rounded hover:bg-modal-btn-hover-bgcl"
            >
              <div className="flex items-center gap-x-3">
                {avatar ? (
                  <Avatar src={avatar} alt="User Avatar" sx={{ height: 32, width: 32 }} />
                ) : (
                  <Avatar sx={{ height: 32, width: 32 }}>{avatar}</Avatar>
                )}
                <div className="text-sm">
                  <p className="font-medium leading-tight">{fullName}</p>
                  <p className="text-xs leading-tight">{email}</p>
                </div>
              </div>
              {loading === id ? (
                <div className="flex h-[28px] pr-2">
                  <LogoLoading size="small" className="m-auto" />
                </div>
              ) : status !== EProjectRequestStatus.PENDING ? (
                <div className={`${setStatusTextColor(status)} text-sm pr-1 font-bold`}>
                  {convertStatus(status)}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => handleAcceptDecline(id, true)}
                    className="bg-confirm-btn-bgcl hover:bg-confirm-btn-hover-bgcl rounded py-1 px-3 text-black"
                  >
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleAcceptDecline(id, false)}
                    className="bg-delete-btn-bgcl hover:bg-delete-btn-hover-bgcl rounded py-1 px-3 text-black"
                  >
                    <span>Decline</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="p-2 rounded-full bg-modal-btn-bgcl w-fit">
              <PersonOutlineIcon className="text-modal-text-cl" />
            </div>
            <p className="mt-2 text-sm">There are no requests to join this project.</p>
          </div>
        )
      ) : (
        <div className="flex w-full h-full">
          <LogoLoading className="m-auto" />
        </div>
      )}
    </div>
  )
}

type TRequestsManagerProps = {
  activeTab: ETabTypes
  projectId: number
}

export const RequestsManager = ({ activeTab, projectId }: TRequestsManagerProps) => {
  return (
    <>
      <JoinRequests active={activeTab === ETabTypes.JOIN_REQUESTS} projectId={projectId} />
      <SentInvitations active={activeTab === ETabTypes.SENT_INVITATIONS} projectId={projectId} />
    </>
  )
}
