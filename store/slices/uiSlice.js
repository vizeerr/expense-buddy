import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Personal
    isAddExpenseOpen: false,
    isAddBudgetOpen: false,

    // Group
    isAddGroupOpen: false,
    isAddGroupExpenseOpen: false,
    isAddGroupBudgetOpen: false,
    
    isEditGroupOpen:false,
    isInviteGroupOpen:false,
    isManageMembersOpen:true,

    // Expense modals (personal)
    viewExpense: { open: false, id: null },
    editExpense: { open: false, id: null },
    deleteExpense: { open: false, id: null },
    
    // Expense modals (group)
    viewGroupExpense: { open: false, id: null },
    editGroupExpense: { open: false, id: null },
    deleteGroupExpense: { open: false, id: null },
  },

  reducers: {
    // 🔹 Personal Add Expense & Budget
    openAddExpense: (state) => { state.isAddExpenseOpen = true },
    closeAddExpense: (state) => { state.isAddExpenseOpen = false },
    openAddBudget: (state) => { state.isAddBudgetOpen = true },
    closeAddBudget: (state) => { state.isAddBudgetOpen = false },

    // 🔹 Group Add: Group, Expense, Budget
    openAddGroup: (state) => { state.isAddGroupOpen = true },
    closeAddGroup: (state) => { state.isAddGroupOpen = false },
    openAddGroupExpense: (state) => { state.isAddGroupExpenseOpen = true },
    closeAddGroupExpense: (state) => { state.isAddGroupExpenseOpen = false },
    openGroupAddBudget: (state) => { state.isAddGroupBudgetOpen = true },
    closeGroupAddBudget: (state) => { state.isAddGroupBudgetOpen = false },
    openGroupEdit: (state) => { state.isEditGroupOpen = true },
    closeGroupEdit: (state) => { state.isEditGroupOpen = false },
    openGroupInvite: (state) => { state.isInviteGroupOpen = true },
    closeGroupInvite: (state) => { state.isInviteGroupOpen = false },
    openManageMembers: (state) => { state.isManageMembersOpen = true },
    closeManageMembers: (state) => { state.isManageMembersOpen = false },

    


    // 🔹 Personal Expense Modals
    openViewExpense: (state, action) => {
      state.viewExpense = { open: true, id: action.payload }
    },
    closeViewExpense: (state) => {
      state.viewExpense = { open: false, id: null }
    },
    openEditExpense: (state, action) => {
      state.editExpense = { open: true, id: action.payload }
    },
    closeEditExpense: (state) => {
      state.editExpense = { open: false, id: null }
    },
    openDeleteExpense: (state, action) => {
      state.deleteExpense = { open: true, id: action.payload }
    },
    closeDeleteExpense: (state) => {
      state.deleteExpense = { open: false, id: null }
    },

    // 🔹 Group Expense Modals
    openGroupViewExpense: (state, action) => {
      state.viewGroupExpense = { open: true, id: action.payload }
    },
    closeGroupViewExpense: (state) => {
      state.viewGroupExpense = { open: false, id: null }
    },
    openGroupEditExpense: (state, action) => {
      state.editGroupExpense = { open: true, id: action.payload }
    },
    closeGroupEditExpense: (state) => {
      state.editGroupExpense = { open: false, id: null }
    },
    openGroupDeleteExpense: (state, action) => {
      state.deleteGroupExpense = { open: true, id: action.payload }
    },
    closeGroupDeleteExpense: (state) => {
      state.deleteGroupExpense = { open: false, id: null }
    },
  }
})

export const {
  // Personal
  openAddExpense, closeAddExpense,
  openAddBudget, closeAddBudget,
  openViewExpense, closeViewExpense,
  openEditExpense, closeEditExpense,
  openDeleteExpense, closeDeleteExpense,

  // Group
  openAddGroup, closeAddGroup,
  openAddGroupExpense, closeAddGroupExpense,
  openGroupViewExpense, closeGroupViewExpense,
  openGroupEditExpense, closeGroupEditExpense,
  openGroupDeleteExpense, closeGroupDeleteExpense,
  openGroupAddBudget, closeGroupAddBudget,closeGroupEdit,openGroupEdit,openGroupInvite,closeGroupInvite,
  openManageMembers,closeManageMembers
} = uiSlice.actions

export default uiSlice.reducer
