import { fetchExpensesSummary } from '@/store/slices/dashboard/expensesSummarySlice'
import { fetchBalanceSummary } from '@/store/slices/dashboard/balanceSlice'
import { fetchBudgetSummary } from '@/store/slices/dashboard/budgetSummarySlice'
import { fetchAnalytics } from '@/store/slices/dashboard/analyticsSlice'
import { fetchExpenses } from '@/store/slices/dashboard/expensesSlice'

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