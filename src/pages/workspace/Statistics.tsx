import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { getCssVar } from "../../utils/helpers"
import type { TStatisticsData } from "../../services/types"
import { workspaceService } from "../../services/workspace-service"
import { toast } from "react-toastify"
import axiosErrorHandler from "../../utils/axios-error-handler"
import { LogoLoading } from "../../components/Loadings"

const MAX_NAME_LENGTH: number = 10

type TColors = {
  owned: string
  joined: string
  completed: string
  pending: string
  membersCount: string
}

type TMemberData = {
  projectName: string
  memberCount: number
  color: string
}

type TPhaseData = {
  projectName: string
  phaseCount: number
  color: string
}

type TStatisticsDashboardProps = {
  stats: TStatisticsData
  colors: TColors
}

const StatisticsDashboard = ({ stats, colors }: TStatisticsDashboardProps) => {
  const projectData = [
    { name: "Owned Projects", value: stats.ownedProjectsCount, color: colors.owned },
    { name: "Joined Projects", value: stats.joinedProjectsCount, color: colors.joined },
  ]

  const taskData = [
    { name: "Completed Tasks", value: stats.completedTasksCount, color: colors.completed },
    { name: "On Going Tasks", value: stats.pendingTasksCount, color: colors.pending },
  ]

  const phaseData = stats.phaseStats.map<TPhaseData>((phase) => ({
    projectName: phase.projectName.slice(0, MAX_NAME_LENGTH),
    phaseCount: phase.phaseCount,
    color: colors.membersCount,
  }))

  const memberData = stats.projectMemberStats.map<TMemberData>((member) => ({
    projectName: member.projectName.slice(0, MAX_NAME_LENGTH),
    memberCount: member.memberCount,
    color: colors.membersCount,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="bg-[color:var(--ht-modal-popover-bgcl)] rounded-lg shadow p-4">
        <h2 className="text-regular-text-cl text-lg font-bold mb-4">Project Statistics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={projectData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={(entry) => `${entry.name}: ${entry.value}`}
            >
              {projectData.map((entry, index) => (
                <Cell key={`cell-project-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[color:var(--ht-modal-popover-bgcl)] rounded-lg shadow p-4">
        <h2 className="text-regular-text-cl text-lg font-bold mb-4">Task Statistics In Projects</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={taskData}>
            <XAxis dataKey="name" stroke="white" />
            <YAxis stroke="white" />
            <Tooltip />
            <Bar dataKey="value">
              {taskData.map((entry, index) => (
                <Cell key={`cell-task-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[color:var(--ht-modal-popover-bgcl)] rounded-lg shadow p-4">
        <h2 className="text-regular-text-cl text-lg font-bold mb-4">
          Phase Statistics In Projects
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={phaseData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis dataKey="projectName" stroke="white" />
            <YAxis type="number" stroke="white" />
            <Tooltip />
            <Bar dataKey="phaseCount">
              {phaseData.map((_, index) => (
                <Cell key={`cell-phase-${index}`} fill={colors.membersCount} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[color:var(--ht-modal-popover-bgcl)] rounded-lg shadow p-4">
        <h2 className="text-regular-text-cl text-lg font-bold mb-4">
          Member Statistics In Projects (Include User)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={memberData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <XAxis dataKey="projectName" stroke="white" />
            <YAxis type="number" stroke="white" />
            <Tooltip />
            <Bar dataKey="memberCount">
              {memberData.map((entry, index) => (
                <Cell key={`cell-member-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

type TRefreshSectionProps = {
  onRefresh: () => Promise<void>
}

const RefreshSection = ({ onRefresh }: TRefreshSectionProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  return (
    <div className="flex gap-2">
      <button
        className="text-regular-text-cl px-4 h-8 rounded bg-modal-btn-hover-bgcl"
        onClick={handleRefresh}
      >
        {isRefreshing ? (
          <div className="flex w-full h-full">
            <LogoLoading className="m-auto" size="small" />
          </div>
        ) : (
          <span className="text-sm font-medium">Refresh</span>
        )}
      </button>
    </div>
  )
}

export const Statistics = () => {
  const [stats, setStats] = useState<TStatisticsData>()
  const [colors, setColors] = useState<TColors>()

  const initColors = () => {
    setColors({
      owned: getCssVar("--ht-rich-file-title-cl"), // blue: chủ sở hữu
      joined: getCssVar("--ht-warning-text-cl"), // vàng: tham gia
      completed: getCssVar("--ht-success-text-cl"), // xanh: hoàn thành
      pending: getCssVar("--ht-error-text-cl"), // đỏ: chưa hoàn thành
      membersCount: getCssVar("--ht-rich-file-title-cl"),
    })
  }

  const fetchStats = async () => {
    try {
      const stats = await workspaceService.getStatistics()
      setStats(stats)
    } catch (error) {
      toast.error(axiosErrorHandler.handleHttpError(error).message)
    }
  }

  useEffect(() => {
    fetchStats()
    initColors()
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Statistics</h1>
        <RefreshSection onRefresh={fetchStats} />
      </div>
      {stats && colors ? (
        <StatisticsDashboard stats={stats} colors={colors} />
      ) : (
        <div className="flex w-full h-full">
          <LogoLoading className="m-auto" />
        </div>
      )}
    </div>
  )
}
