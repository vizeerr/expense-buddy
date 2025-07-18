import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 🔄 Fetch group expenses with filters & pagination
export const fetchGroupExpenses = createAsyncThunk(
  'groupExpenses/fetchGroupExpenses',
  async ({ groupId, page = 1, limit = 10, search = '', type = '', category = '', paymentMethod = '', trashed = 'false', paidBy = '', addedBy = '' }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(type && { type }),
        ...(category && { category }),
        ...(paymentMethod && { paymentMethod }),
        ...(paidBy && { paidBy }),
        ...(addedBy && { addedBy }),
        trashed: String(trashed),
      })

      const res = await axios.get(`/api/groups/${groupId}/expenses/get-expenses?${params.toString()}`)
      return {
        data: res.data.expenses || [],
        page,
        hasMore: res.data.pagination?.hasMore || res.data.expenses.length > 0,
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch group expenses')
    }
  }
)

const groupExpensesSlice = createSlice({
  name: 'groupExpenses',
  initialState: {
    list: [],
    loading: false,
    error: null,
    page: 1,
    hasMore: true,
    filters: {
      search: '',
      type: '',
      category: '',
      paymentMethod: '',
      paidBy: '',
      addedBy: '', 
      trashed: 'false',
    },
  },
  reducers: {
    addGroupExpense(state, action) {
      state.list.unshift(action.payload)
    },
    updateGroupExpense(state, action) {
      const index = state.list.findIndex((item) => item._id === action.payload._id)
      if (index !== -1) state.list[index] = action.payload
    },
    deleteGroupExpense(state, action) {
      state.list = state.list.filter((item) => item._id !== action.payload)
    },
    setGroupExpenseFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1
      state.list = []
      state.hasMore = true
    },
    toggleGroupTrashView(state) {
      state.filters.trashed = state.filters.trashed === 'true' ? 'false' : 'true'
      state.page = 1
      state.list = []
      state.hasMore = true
    },
    resetGroupExpenses(state) {
      state.list = []
      state.page = 1
      state.hasMore = true
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
        const { data, page, hasMore } = action.payload
        state.loading = false
        state.page = page
        state.hasMore = hasMore
        state.list = page === 1 ? data : [...state.list, ...data]
      })
      .addCase(fetchGroupExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const {
  addGroupExpense,
  updateGroupExpense,
  deleteGroupExpense,
  setGroupExpenseFilters,
  resetGroupExpenses,
  toggleGroupTrashView,
} = groupExpensesSlice.actions

export default groupExpensesSlice.reducer
