import { styled, Tab, Tabs } from "@mui/material"
import type { TProjectMemberData } from "../../../services/types"
import { ProjectMembers } from "./ProjectMembers"
import { useState } from "react"
import { ETabTypes } from "./sharing"
import { RequestsManager } from "./RequestsManager"

type TMemberAndRequestsProps = {
  projectMembers: TProjectMemberData[]
  projectId: number
}

export const MemberAndRequests = ({ projectMembers, projectId }: TMemberAndRequestsProps) => {
  const [activeTab, setActiveTab] = useState<ETabTypes>(ETabTypes.PROJECT_MEMBERS)

  const changeTab = (_: React.SyntheticEvent, newValue: ETabTypes) => {
    setActiveTab(newValue)
  }

  return (
    <div className="mt-5 text-modal-text-cl w-full">
      <StyledTabsList value={activeTab} onChange={changeTab}>
        <Tab
          label="Project members"
          value={ETabTypes.PROJECT_MEMBERS}
          icon={<div className="members-count">{projectMembers.length || 0}</div>}
          iconPosition="end"
        />
        {/* <Tab label="Join requests" value={ETabTypes.JOIN_REQUESTS} />
            <Tab label="Sent invitations" value={ETabTypes.SENT_INVITATIONS} /> */}
      </StyledTabsList>
      <div className="h-[230px] overflow-y-auto css-styled-vt-scrollbar">
        <ProjectMembers
          projectMembers={projectMembers}
          active={activeTab === ETabTypes.PROJECT_MEMBERS}
        />
        <RequestsManager activeTab={activeTab} projectId={projectId} />
      </div>
    </div>
  )
}

const StyledTabsList = styled(Tabs)({
  "&.MuiTabs-root": {
    minHeight: "unset",
    zIndex: 10,
    position: "relative",
    "& .MuiTabs-flexContainer": {
      borderBottom: "2px var(--ht-divider-cl) solid",
      columnGap: 10,
      "& .MuiTab-root": {
        padding: "8px 8px 6px 8px",
        textTransform: "unset",
        minHeight: "unset",
        color: "var(--ht-modal-text-cl)",
        fontWeight: 500,
        "& .members-count": {
          color: "var(--ht-regular-text-cl)",
          padding: 3,
          backgroundColor: "var(--ht-modal-btn-bgcl)",
          lineHeight: 1,
          borderRadius: "50%",
          marginLeft: 5,
          height: 20,
          width: 20,
        },
        "&:hover": {
          color: "var(--ht-confirm-btn-bgcl)",
          "& .members-count": {
            color: "var(--ht-confirm-btn-bgcl)",
          },
        },
        "&.Mui-selected": {
          color: "var(--ht-confirm-btn-bgcl)",
          "& .members-count": {
            color: "var(--ht-confirm-btn-bgcl)",
          },
        },
      },
    },
  },
})
