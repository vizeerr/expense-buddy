import { fetchExpensesSummary } from '@/store/slices/dashboard/expensesSummarySlice'
import { fetchBalanceSummary } from '@/store/slices/dashboard/balanceSlice'
import { fetchBudgetSummary } from '@/store/slices/dashboard/budgetSummarySlice'
import { fetchAnalytics } from '@/store/slices/dashboard/analyticsSlice'
import { fetchExpenses } from '@/store/slices/dashboard/expensesSlice'

import { fetchGroupBalanceSummary } from '@/store/slices/group/groupBalanceSlice'
import { fetchGroupExpenseSummary } from '@/store/slices/group/groupExpenseSummarySlice'
import { fetchGroupBudgetSummary } from '@/store/slices/group/groupBudgetSummarySlice'
import { fetchGroupAnalytics } from '@/store/slices/group/groupAnalyticsSlice'
import { fetchGroupExpenses } from '@/store/slices/group/groupExpensesSlice'

let lastFetchTimestamp = 0
let cachedPromise = null

export const fetchDashboard = (dispatch, { force = false } = {}) =>{
    const now = Date.now()

  // ✅ If fetched less than 30 seconds ago, use cached result (unless forced)
  if (!force && now - lastFetchTimestamp < 30_000 && cachedPromise) {
    return cachedPromise
  }

  // ✅ Otherwise, batch fetch and memoize
  cachedPromise = Promise.all([
    dispatch(fetchExpenses({page:1})),
    dispatch(fetchExpensesSummary()),
    dispatch(fetchBalanceSummary()),
    dispatch(fetchBudgetSummary()),
    dispatch(fetchAnalytics()),
  ]).finally(() => {
    lastFetchTimestamp = Date.now()
  })

  return cachedPromise

}


const lastFetchTimestampByGroup = {}
const cachedGroupPromises = {}

export const fetchGroupDashboard = (dispatch, groupId, { force = false } = {}) => {
  if (!groupId) return Promise.resolve()

  const now = Date.now()
  const lastFetch = lastFetchTimestampByGroup[groupId] || 0

  // ✅ Use cached promise if fetched recently (unless forced)
  if (!force && now - lastFetch < 30_000 && cachedGroupPromises[groupId]) {
    return cachedGroupPromises[groupId]
  }

  // ✅ Otherwise, dispatch all in parallel and cache
  const promise = Promise.all([
    dispatch(fetchGroupBalanceSummary(groupId)),
    dispatch(fetchGroupExpenseSummary(groupId)),
    dispatch(fetchGroupBudgetSummary(groupId)),
    dispatch(fetchGroupAnalytics(groupId)),
    dispatch(fetchGroupExpenses({ page: 1, groupId }))
  ]).finally(() => {
    lastFetchTimestampByGroup[groupId] = Date.now()
  })

  cachedGroupPromises[groupId] = promise
  return promise
}

