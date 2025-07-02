import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isAddExpenseOpen: false,
    isAddBudgetOpen: false,
    isAddGroupOpen: false,           // ➕ New
    isAddGroupExpenseOpen: false,    // ➕ New

    viewExpense: { open: false, id: null },
    editExpense: { open: false, id: null },
    deleteExpense: { open: false, id: null },
  },

  reducers: {
    // Add Expense
    openAddExpense: (state) => { state.isAddExpenseOpen = true },
    closeAddExpense: (state) => { state.isAddExpenseOpen = false },

    // Add Budget
    openAddBudget: (state) => { state.isAddBudgetOpen = true },
    closeAddBudget: (state) => { state.isAddBudgetOpen = false },

    // Add Group
    openAddGroup: (state) => { state.isAddGroupOpen = true },
    closeAddGroup: (state) => { state.isAddGroupOpen = false },

    // Add Group Expense
    openAddGroupExpense: (state) => { state.isAddGroupExpenseOpen = true },
    closeAddGroupExpense: (state) => { state.isAddGroupExpenseOpen = false },

    // View Expense
    openViewExpense: (state, action) => {
      state.viewExpense = { open: true, id: action.payload }
    },
    closeViewExpense: (state) => {
      state.viewExpense = { open: false, id: null }
    },

    // Edit Expense
    openEditExpense: (state, action) => {
      state.editExpense = { open: true, id: action.payload }
    },
    closeEditExpense: (state) => {
      state.editExpense = { open: false, id: null }
    },

    // Delete Expense
    openDeleteExpense: (state, action) => {
      state.deleteExpense = { open: true, id: action.payload }
    },
    closeDeleteExpense: (state) => {
      state.deleteExpense = { open: false, id: null }
    },
  },
})

export const {
  openAddExpense, closeAddExpense,
  openAddBudget, closeAddBudget,
  openAddGroup, closeAddGroup,
  openAddGroupExpense, closeAddGroupExpense,
  openViewExpense, closeViewExpense,
  openEditExpense, closeEditExpense,
  openDeleteExpense, closeDeleteExpense,
} = uiSlice.actions

export default uiSlice.reducer
