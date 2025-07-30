import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ✅ Async thunk with date filter support
// slices/dashboard/expensesSlice.js
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async ({ page = 1, limit = 10, search = '', type = '', category = '', paymentMethod = '', trashed = "false", fromDate = '', toDate = '' }, thunkAPI) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(type && { type }),
        ...(category && { category }),
        ...(paymentMethod && { paymentMethod }),
        trashed: String(trashed),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      })

      const res = await fetch(`/api/expenses/get-all-expenses?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch expenses')

      const data = await res.json()
      return {
        data: data.expenses || [],
        page,
        hasMore: data.pagination?.hasMore || false,
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message)
    }
  }
)


const expensesSlice = createSlice({
  name: 'expenses',
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
      trashed: 'false',
      fromDate: '', // ✅ Added
      toDate: '',   // ✅ Added
    },
  },
  reducers: {
    addExpense(state, action) {
      state.list.unshift(action.payload)
    },
    updateExpense(state, action) {
      const index = state.list.findIndex(item => item._id === action.payload._id)
      if (index !== -1) state.list[index] = action.payload
    },
    deleteExpense(state, action) {
      state.list = state.list.filter(item => item._id !== action.payload)
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1
      state.list = []
      state.hasMore = true
    },
    toggleTrashView(state) {
      state.filters.trashed = !state.filters.trashed
      state.page = 1
      state.list = []
      state.hasMore = true
    },
    resetExpenses(state) {
      state.list = []
      state.page = 1
      state.hasMore = true
      state.error = null
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        const { data, page, hasMore } = action.payload
        state.loading = false
        state.page = page
        state.hasMore = hasMore

        if (page === 1) {
          state.list = data
        } else {
          state.list = [...state.list, ...data]
        }
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || 'Something went wrong'
      })
  },
})

export const {
  addExpense,
  updateExpense,
  deleteExpense,
  setFilters,
  resetExpenses,
  toggleTrashView,
} = expensesSlice.actions

export default expensesSlice.reducer
