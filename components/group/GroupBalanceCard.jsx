"use client"

import React, { useEffect } from "react"
import {
  Wallet, HandCoins, TrendingUp, ArrowUpRight, ArrowDown, PiggyBank, Activity,
  Coins, BarChart as BarChartIcon, LineChart as LineChartIcon, FileBarChart,
  Percent, Hourglass, Tag, Target, AreaChart as AreaChartIcon, BadgeDollarSign, Plus
} from "lucide-react"

import {
  LineChart as ReLineChart, BarChart as ReBarChart, AreaChart as ReAreaChart,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Line, Bar, Area
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import { useDispatch, useSelector } from 'react-redux'
import { openAddGroupExpense, openGroupAddBudget } from "@/store/slices/uiSlice"
import { fetchGroupBalanceSummary } from "@/store/slices/group/groupBalanceSlice"
import { fetchGroupExpenseSummary } from "@/store/slices/group/groupExpenseSummarySlice"
import { fetchGroupBudgetSummary } from "@/store/slices/group/groupBudgetSummarySlice"
import { fetchGroupAnalytics } from "@/store/slices/group/groupAnalyticsSlice"
import StatItem from "./StateItem"

const currencyFormat = (val) => `₹ ${val?.toLocaleString?.() || '0'}`

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c",
  "#d0ed57", "#8dd1e1", "#f87171", "#60a5fa", "#facc15"
]

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

const GroupBalanceCard = ({id}) => {
  const dispatch = useDispatch()
  const { summary, loading: balanceLoading } = useSelector(state => state.groupBalance)
  
  
  const { data: expenseData, loading: expenseLoading } = useSelector(state => state.groupExpensesSummary)
  const { data: budgetData, loading: budgetLoading } = useSelector(state => state.groupBudget)
  const { data: analytics, loading: analyticsLoading } = useSelector(state => state.groupAnalytics)
  
  useEffect(() => {
  if (!id) return
    dispatch(fetchGroupBalanceSummary(id))
    dispatch(fetchGroupExpenseSummary(id))
    dispatch(fetchGroupBudgetSummary(id))
    dispatch(fetchGroupAnalytics(id))
  }, [dispatch, id])

  // useEffect(() => {
  //   dispatch(fetchGroupBalanceSummary(id))
  //   console.log(summary);
    
  //   // dispatch(fetchGroupAnalytics())
  // }, [dispatch,id])

  useEffect(() => {
  if (summary) {
    console.log('Group Summary:', summary)
    console.log(expenseData);
    
  }
}, [summary])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 md:gap-6 gap-8">
      
      {/* --- Group Accounts --- */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Wallet />
          <p className="text-xl font-bold">Group Balance</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              {balanceLoading ? <Skeleton className="w-28 h-6 rounded" />
              : <p className="text-2xl font-semibold text-green-400">
                  {currencyFormat(summary?.totalBalance)}
                </p>}
            </div>
            <p className="text-xs text-muted-foreground font-semibold">This Month</p>
          </div>
          <div className="grid gap-3">
            {balanceLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />) : <>
              <StatItem icon={HandCoins} title="Total Credit" subtitle="Group Income" value={currencyFormat(summary?.totalCredit)} />
              <StatItem icon={ArrowDown} title="Total Debit" subtitle="Spendings" value={currencyFormat(summary?.totalDebit)} color="text-red-500" bg="bg-red-950" />
              <StatItem icon={Activity} title="Daily Average" subtitle="This Month" value={currencyFormat(summary?.dailyAverage)} />
              <StatItem icon={Percent} title="Savings Rate" subtitle="This Month" value={`${summary?.savingsRate || '0'}%`} />
              <StatItem icon={TrendingUp} title="Last Month" subtitle="Balance" value={currencyFormat(summary?.lastMonthBalance)} />
            </>}
          </div>
        </CardContent>
      </Card>

      {/* --- Group Expenses --- */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Wallet />
            <p className="text-xl font-bold">Group Expenses</p>
          </div>
          <Button size="sm" onClick={() => dispatch(openAddGroupExpense())}>
            <Plus className="mr-1 h-4 w-4" /> Add Expense
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              {expenseLoading
                ? <Skeleton className="w-28 h-6 rounded" />
                : <p className="text-2xl font-semibold text-red-500">{currencyFormat(expenseData?.totalMonthlyExpense)}</p>
              }
            </div>
            <p className="text-xs font-semibold text-muted-foreground">This Month</p>
          </div>
          <div className="grid gap-3">
            {expenseLoading
              ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
              : <>
                  <StatItem icon={Activity} title="Daily Average" subtitle="This Month" value={currencyFormat(expenseData?.dailyAverage)} color="text-red-400" bg="bg-red-950" />
                  <StatItem icon={BarChartIcon} title="Weekly Average" subtitle="This Month" value={currencyFormat(expenseData?.weeklyAverage)} color="text-red-400" bg="bg-red-950" />
                  <StatItem icon={FileBarChart} title="Monthly Average" subtitle="Last 6 Months" value={currencyFormat(expenseData?.monthlyAverage)} color="text-red-400" bg="bg-red-950" />
                  <StatItem icon={LineChartIcon} title="Total Weekly Expense" subtitle="Current Week" value={currencyFormat(expenseData?.totalWeeklyExpense)} color="text-red-400" bg="bg-red-950" />
                  <StatItem icon={Coins} title="Total Monthly Expense" subtitle="Current Month" value={currencyFormat(expenseData?.totalMonthlyExpense)} color="text-red-400" bg="bg-red-950" />
                </>
            }
          </div>
        </CardContent>
      </Card>

      {/* --- Group Budget --- */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <BadgeDollarSign />
            <p className="text-xl font-bold">Group Budget</p>
          </div>
          <Button size="sm" onClick={() => dispatch(openGroupAddBudget())}>
            <ArrowUpRight className="mr-1 h-4 w-4" /> Add Budget
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Budget</p>
              {budgetLoading
                ? <Skeleton className="w-28 h-6 rounded" />
                : <p className="text-2xl font-semibold text-yellow-400">{currencyFormat(budgetData?.monthlyBudget)}</p>}
            </div>
            <p className="text-xs font-semibold text-muted-foreground">This Month</p>
          </div>
          <div className="grid gap-3">
            {budgetLoading
              ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
              : <>
                  <StatItem icon={ArrowUpRight} title="Used Budget" subtitle="So far" value={currencyFormat(budgetData?.usedBudget)} color="text-yellow-300" bg="bg-yellow-900" />
                  <StatItem icon={PiggyBank} title="Remaining Budget" subtitle="Left to Spend" value={currencyFormat(budgetData?.remainingBudget)} color="text-green-300" bg="bg-green-900" />
                  <StatItem icon={Hourglass} title="Days Left" subtitle="In Budget Cycle" value={`${budgetData?.daysLeft || 0} Days`} color="text-blue-400" bg="bg-blue-950" />
                  <StatItem icon={Tag} title="Most Spent In" subtitle={budgetData?.mostExpendedCategory?.name || "-"} value={currencyFormat(budgetData?.mostExpendedCategory?.amount)} color="text-red-400" bg="bg-red-950" />
                  <StatItem icon={Target} title="Goal Progress" subtitle="Budget Utilization" value={`${budgetData?.goalProgress || 0}%`} />
                </>
            }
          </div>
        </CardContent>
      </Card>

      {/* --- Group Analytics Charts --- */}
      <Card className="col-span-1 lg:col-span-1 2xl:col-span-3">
        <CardHeader className="flex gap-2 items-center">
          <AreaChartIcon />
          <p className="text-xl font-bold">Group Analytics</p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 2xl:gap-6 gap-4">
          <ChartCard title="Balance Trend" subtitle="Last 4 Weeks">
            <ReLineChart data={analytics?.balanceTrend || []}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
            </ReLineChart>
          </ChartCard>
          <ChartCard title="Expense Pattern" subtitle="Weekly Breakdown">
            <ReBarChart data={analytics?.expensePattern || []}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="expense">
                {(analytics?.expensePattern || []).map((_, i) => (
                  <Cell key={i} fill="#f87171" />
                ))}
              </Bar>
            </ReBarChart>
          </ChartCard>
          <ChartCard title="Budget Utilization" subtitle="Current Cycle">
            <ReAreaChart data={analytics?.budgetUtilization || []}>
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip />
              <Area type="monotone" dataKey="expense" stroke="#facc15" fill="#facc15" fillOpacity={0.2} />
            </ReAreaChart>
          </ChartCard>
          <ChartCard title="Category Wise Expenditure" subtitle="Spending Habits">
            <ResponsiveContainer width="100%" height={180}>
              <ReBarChart data={analytics?.categoryWise || []} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="price" radius={[4, 4, 4, 4]}>
                  {(analytics?.categoryWise || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </CardContent>
      </Card>
    </div>
  )
}

export default GroupBalanceCard
