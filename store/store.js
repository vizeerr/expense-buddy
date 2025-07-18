// redux/store.js
import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

import expensesReducer from './slices/dashboard/expensesSlice';
import balanceReducer from './slices/dashboard/balanceSlice';
import expensesSummaryReducer from './slices/dashboard/expensesSummarySlice';
import budgetReducer from './slices/dashboard/budgetSummarySlice';
import analyticsReducer from './slices/dashboard/analyticsSlice';

import groupsReducer from './slices/group/groupSlice';
import groupDetailReducer from './slices/group/groupDetailSlice';
import groupBalanceReducer from './slices/group/groupBalanceSlice';
import groupExpensesReducer from './slices/group/groupExpensesSlice';
import groupExpensesSummaryReducer from './slices/group/groupExpenseSummarySlice';
import groupBudgetReducer from './slices/group/groupBudgetSummarySlice';
import groupAnalyticsReducer from './slices/group/groupAnalyticsSlice';
import memberSummarySlice from './slices/group/memberSummarySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,

    // Dashboard-level data
    expenses: expensesReducer,
    balance: balanceReducer,
    expensesSummary: expensesSummaryReducer,
    budget: budgetReducer,
    analytics: analyticsReducer,

    // Group-level data
    groups: groupsReducer,
    groupDetail: groupDetailReducer,
    groupBalance: groupBalanceReducer,
    groupExpenses: groupExpensesReducer,
    groupExpensesSummary: groupExpensesSummaryReducer,
    groupBudget: groupBudgetReducer,
    groupAnalytics: groupAnalyticsReducer,
    groupMember:memberSummarySlice
  },
});
