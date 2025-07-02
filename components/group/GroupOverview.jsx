'use client'

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchGroupSummary
} from '@/store/slices/groupSummarySlice'
import {
  fetchGroupBudgetSummary
} from '@/store/slices/groupBudgetSlice'
import {
  fetchGroupAnalytics
} from '@/store/slices/groupAnalyticsSlice'

import { Wallet, HandCoins, ArrowDown, Activity, Percent, BadgeDollarSign, PiggyBank, Hourglass, Tag, Target, TrendingUp } from 'lucide-react'
import { AreaChart as AreaChartIcon, BarChart as BarChartIcon, FileBarChart, LineChart as LineChartIcon, Coins } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import StatItem from '../dashboard/StateItem'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, BarChart, AreaChart, XAxis, YAxis, Tooltip, Line, Bar, Area, Cell } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a4de6c', '#d0ed57', '#8dd1e1', '#f87171', '#60a5fa', '#facc15']

const ChartCard = ({ title, subtitle, children }) => (
  <Card className="bg-muted">
    <CardHeader>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </CardHeader>
    <CardContent className="2xl:h-36 xl:h-24 md:h-20 h-25">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </CardContent>
  </Card>
)

const GroupOverview = ({ groupId }) => {
  const dispatch = useDispatch()

  const { summary, loading: loadingSummary } = useSelector((state) => state.groupSummary)
  const { data: budgetData, loading: loadingBudget } = useSelector((state) => state.groupBudget)
  const { data: analytics, loading: loadingAnalytics } = useSelector((state) => state.groupAnalytics)

  useEffect(() => {
    if (groupId) {
      dispatch(fetchGroupSummary(groupId))
      dispatch(fetchGroupBudgetSummary(groupId))
      dispatch(fetchGroupAnalytics(groupId))
    }
  }, [dispatch, groupId])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">

      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Wallet />
          <p className="text-xl font-bold">Group Balance</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3">
            {loadingSummary ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
            ) : (
              <>
                <StatItem icon={HandCoins} title="Total Credit" subtitle="Group Income" value={`₹ ${summary?.totalCredit?.toLocaleString?.() || '0'}`} />
                <StatItem icon={ArrowDown} title="Total Debit" subtitle="Group Expense" value={`₹ ${summary?.totalDebit?.toLocaleString?.() || '0'}`} color="text-red-500" bg="bg-red-950" />
                <StatItem icon={Activity} title="Daily Avg" subtitle="This Month" value={`₹ ${summary?.dailyAverage?.toLocaleString?.() || '0'}`} />
                <StatItem icon={Percent} title="Savings Rate" subtitle="This Month" value={`${summary?.savingsRate || '0'}%`} />
                <StatItem icon={TrendingUp} title="Last Month" subtitle="Balance" value={`₹ ${summary?.lastMonthBalance?.toLocaleString?.() || '0'}`} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <BadgeDollarSign />
          <p className="text-xl font-bold">Group Budget</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3">
            {loadingBudget ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
            ) : (
              <>
                <StatItem icon={PiggyBank} title="Remaining Budget" subtitle="Left to Spend" value={`₹ ${budgetData?.remainingBudget?.toLocaleString?.() || '0'}`} color="text-green-300" bg="bg-green-900" />
                <StatItem icon={Hourglass} title="Days Left" subtitle="In Budget Cycle" value={`${budgetData?.daysLeft || 0} Days`} />
                <StatItem icon={Tag} title="Most Spent In" subtitle={budgetData?.mostExpendedCategory?.name || '-'} value={`₹ ${budgetData?.mostExpendedCategory?.amount?.toLocaleString?.() || '0'}`} color="text-red-300" bg="bg-red-900" />
                <StatItem icon={Target} title="Goal Progress" subtitle="Utilization" value={`${budgetData?.goalProgress || 0}%`} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card className="col-span-1 lg:col-span-2 2xl:col-span-3">
        <CardHeader className="flex gap-2 items-center">
          <AreaChartIcon />
          <p className="text-xl font-bold">Group Analytics</p>
        </CardHeader>

        <CardContent className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
          <ChartCard title="Balance Trend" subtitle="Last 4 Weeks">
            <LineChart data={analytics?.balanceTrend || []}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ChartCard>

          <ChartCard title="Expense Pattern" subtitle="Weekly Breakdown">
            <BarChart data={analytics?.expensePattern || []}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="expense">
                {(analytics?.expensePattern || []).map((_, i) => (
                  <Cell key={i} fill="#f87171" />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>

          <ChartCard title="Budget Utilization" subtitle="Current Cycle">
            <AreaChart data={analytics?.budgetUtilization || []}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="expense" stroke="#facc15" fill="#facc15" fillOpacity={0.2} />
            </AreaChart>
          </ChartCard>

          <ChartCard title="Category Wise" subtitle="Spending Habits">
            <BarChart data={analytics?.categoryWise || []} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="price" fill="#60a5fa" radius={[4, 4, 4, 4]}>
                {(analytics?.categoryWise || []).map((_, index) => (
                  <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        </CardContent>
      </Card>

    </div>
  )
}

export default GroupOverview
