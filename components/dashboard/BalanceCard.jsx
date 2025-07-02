"use client"

import React, { useEffect } from "react"
import {
  Wallet, HandCoins, TrendingUp, ArrowUpRight, ArrowDown,
  PiggyBank, Activity, Coins, BarChart as BarChartIcon,
  LineChart as LineChartIcon, FileBarChart, Percent,
  Hourglass, Tag, Target, AreaChart as AreaChartIcon, BadgeDollarSign,
  Plus
} from "lucide-react"

import {
  LineChart as ReLineChart, BarChart as ReBarChart, AreaChart as ReAreaChart, PieChart, Pie,
  Line, Bar, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton'
import { openAddExpense, openAddBudget } from "@/store/slices/uiSlice"
import { useDispatch, useSelector } from 'react-redux'
import { fetchBalanceSummary } from '@/store/slices/balanceSlice'
import { fetchExpensesSummary } from '@/store/slices/expensesSummarySlice'
import { fetchBudgetSummary } from '@/store/slices/budgetSummarySlice'
import { fetchAnalytics } from '@/store/slices/analyticsSlice'
import StatItem from "./StateItem"

const COLORS = [
  "#8884d8", // Purple
  "#82ca9d", // Light Green
  "#ffc658", // Yellow
  "#ff7f50", // Coral
  "#a4de6c", // Lime
  "#d0ed57", // Light Lime
  "#8dd1e1", // Sky Blue
  "#f87171", // Red
  "#60a5fa", // Blue
  "#facc15", // Amber
];

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

const BalanceCard = () => {
  const dispatch = useDispatch()
  const { summary, loading: balanceLoading } = useSelector(state => state.balance)

  const { data: expenseData, loading: expenseLoading } = useSelector(state => state.expensesSummary)
  const { data: budgetData, loading: budgetLoading } = useSelector(state => state.budget)
  const { data: analytics, loading: analyticsLoading } = useSelector(state => state.analytics)

  useEffect(() => {
    dispatch(fetchBalanceSummary())
    dispatch(fetchExpensesSummary())
    dispatch(fetchBudgetSummary())
    dispatch(fetchAnalytics())
  }, [dispatch])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 md:gap-6 gap-8">

      {/* Accounts Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Wallet />
          <p className="text-xl font-bold">Accounts</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Balance</p>
              {balanceLoading
                ? <Skeleton className="w-28 h-6 rounded" />
                : <p className="text-2xl font-semibold text-green-400">
                    ₹ {summary?.totalBalance?.toLocaleString?.() || '0'}
                  </p>}
            </div>
            <p className="text-xs text-muted-foreground font-semibold">This Month</p>
          </div>

          <div className="grid gap-3">
            {balanceLoading ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
            ) : (
              <>
                <StatItem
                  icon={HandCoins}
                  title="Total Credit"
                  subtitle="Income"
                  value={`₹ ${summary?.totalCredit?.toLocaleString?.() || '0'}`}
                />
                <StatItem
                  icon={ArrowDown}
                  title="Total Debit"
                  subtitle="Spendings"
                  value={`₹ ${summary?.totalDebit?.toLocaleString?.() || '0'}`}
                  color="text-red-500"
                  bg="bg-red-950"
                />
                <StatItem
                  icon={Activity}
                  title="Daily Average"
                  subtitle="This Month"
                  value={`₹ ${summary?.dailyAverage?.toLocaleString?.() || '0'}`}
                />
                <StatItem
                  icon={Percent}
                  title="Savings Rate"
                  subtitle="This Month"
                  value={`${summary?.savingsRate || '0'}%`}
                />
                <StatItem
                  icon={TrendingUp}
                  title="Last Month"
                  subtitle="Balance"
                  value={`₹ ${summary?.lastMonthBalance?.toLocaleString?.() || '0'}`}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expenses Card */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Wallet />
            <p className="text-xl font-bold">Expenses</p>
          </div>
          <Button size="sm" onClick={() => dispatch(openAddExpense())}>
            <Plus className="mr-1 h-4 w-4" /> Add Expense
          </Button>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              {expenseLoading || !expenseData
                ? <Skeleton className="w-28 h-6 rounded" />
                : <p className="text-2xl font-semibold text-red-500">
                    ₹ {expenseData.totalMonthlyExpense?.toLocaleString?.() || '0'}
                  </p>}
            </div>
            <p className="text-xs font-semibold text-muted-foreground">This Month</p>
          </div>

          <div className="grid gap-3">
            {expenseLoading || !expenseData ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
            ) : (
              <>
                <StatItem
                  icon={Activity}
                  title="Daily Average"
                  subtitle="This Month"
                  value={`₹ ${expenseData.dailyAverage?.toLocaleString?.() || '0'}`}
                />
                <StatItem
                  icon={BarChartIcon}
                  title="Weekly Average"
                  subtitle="This Month"
                  value={`₹ ${expenseData.weeklyAverage?.toLocaleString?.() || '0'}`}
                />
                <StatItem
                  icon={FileBarChart}
                  title="Monthly Average"
                  subtitle="Last 6 Months"
                  value={`₹ ${expenseData.monthlyAverage?.toLocaleString?.() || '0'}`}
                />
                <StatItem
                  icon={LineChartIcon}
                  title="Total Weekly Expense"
                  subtitle="Current Week"
                  value={`₹ ${expenseData.totalWeeklyExpense?.toLocaleString?.() || '0'}`}
                />
                <StatItem
                  icon={Coins}
                  title="Total Monthly Expense"
                  subtitle="Current Month"
                  value={`₹ ${expenseData.totalMonthlyExpense?.toLocaleString?.() || '0'}`}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Card */}
      <Card>
  <CardHeader className="flex justify-between items-center">
    <div className="flex gap-2 items-center">
      <BadgeDollarSign />
      <p className="text-xl font-bold">Budget</p>
    </div>
    <Button size="sm" onClick={() => dispatch(openAddBudget())}>
      <ArrowUpRight className="mr-1 h-4 w-4" /> Add Budget
    </Button>
  </CardHeader>

  <CardContent className="space-y-5">
    <div className="flex justify-between">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Monthly Budget</p>
        {budgetLoading || !budgetData ? (
          <Skeleton className="w-28 h-6 rounded" />
        ) : (
          <p className="text-2xl font-semibold text-yellow-400">
            ₹ {budgetData?.monthlyBudget?.toLocaleString?.() || '0'}
          </p>
        )}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">This Month</p>
    </div>

    <div className="grid gap-3">
      {budgetLoading || !budgetData ? (
        Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-[58px] w-full rounded-lg" />)
      ) : (
        <>
          <StatItem
            icon={ArrowUpRight}
            title="Used Budget"
            subtitle="So far"
            value={`₹ ${budgetData?.usedBudget?.toLocaleString?.() || '0'}`}
            color="text-yellow-300"
            bg="bg-yellow-900"
          />
          <StatItem
            icon={PiggyBank}
            title="Remaining Budget"
            subtitle="Left to Spend"
            value={`₹ ${budgetData?.remainingBudget?.toLocaleString?.() || '0'}`}
            color="text-green-300"
            bg="bg-green-900"
          />
          <StatItem
            icon={Hourglass}
            title="Days Left"
            subtitle="In Budget Cycle"
            value={`${budgetData?.daysLeft || 0} Days`}
          />
          <StatItem
            icon={Tag}
            title="Most Spent In"
            subtitle={budgetData?.mostExpendedCategory?.name || "-"}
            value={`₹ ${budgetData?.mostExpendedCategory?.amount?.toLocaleString?.() || '0'}`}
            color="text-red-300"
            bg="bg-red-900"
          />
          <StatItem
            icon={Target}
            title="Goal Progress"
            subtitle="Budget Utilization"
            value={`${budgetData?.goalProgress || 0}%`}
          />
        </>
      )}
    </div>
  </CardContent>
      </Card>


      {/* Analytics Section */}
      <Card className="col-span-1 lg:col-span-1 2xl:col-span-3">
  <CardHeader className="flex gap-2 items-center">
    <AreaChartIcon />
    <p className="text-xl font-bold">Analytics</p>
  </CardHeader>

  <CardContent className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 2xl:gap-6 gap-4">
    {/* Account Balance Trend - Line Chart */}
    <ChartCard title="Account Balance Trend" subtitle="Past 4 Weeks">
      <ReLineChart data={analytics?.balanceTrend || []}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#34d399"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </ReLineChart>
    </ChartCard>

    {/* Expense Pattern - Bar Chart */}
    <ChartCard title="Expense Pattern" subtitle="Weekly Breakdown">
      <ReBarChart data={analytics?.expensePattern || []}>
  <XAxis dataKey="name" hide />
  <YAxis hide />
  <Tooltip />
  <Bar dataKey="expense">
    {(analytics?.expensePattern || []).map((_, index) => (
      <Cell key={index} fill="#f87171" />
    ))}
  </Bar>
</ReBarChart>

    </ChartCard>

    {/* Budget Utilization - Area Chart */}
    <ChartCard title="Budget Utilization" subtitle="Current Cycle">
      <ReAreaChart data={analytics?.budgetUtilization || []}>
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#facc15"
          fill="#facc15"
          fillOpacity={0.2}
        />
      </ReAreaChart>
    </ChartCard>

    {/* Category Wise Expenditure - Pie Chart */}
   <ChartCard title="Category Wise Expenditure" subtitle="Spending Habits">
  <ResponsiveContainer width="100%" height={180}>
    <ReBarChart
      data={analytics?.categoryWise || []}
      layout="vertical"
      margin={{ top: 10, right: 10, left: 20, bottom: 10 }}
    >
      <XAxis type="number" hide />
      <YAxis
        type="category"
        dataKey="name"
        width={80}
        tick={{ fill: "#cbd5e1", fontSize: 12 }}
      />
      <Tooltip />
      <Bar dataKey="price" fill="#60a5fa" radius={[4, 4, 4, 4]}>
        {(analytics?.categoryWise || []).map((_, index) => (
          <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
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

export default BalanceCard
