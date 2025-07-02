// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import expensesReducer from './slices/expensesSlice';
import balanceReducer from './slices/balanceSlice'
import expensesSummaryReducer from './slices/expensesSummarySlice'
import budgetReducer from './slices/budgetSummarySlice'
import analyticsReducer from './slices/analyticsSlice'
import groupsReducer from './slices/groupSlice'
import groupDetailReducer from './slices/groupDetailSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    expenses:expensesReducer,
    balance: balanceReducer,
    expensesSummary: expensesSummaryReducer,
    budget: budgetReducer,
    analytics: analyticsReducer,
    groups: groupsReducer,
    groupDetail: groupDetailReducer,
  },
});
