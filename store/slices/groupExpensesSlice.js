import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 🔄 Fetch paginated group expenses
export const fetchGroupExpenses = createAsyncThunk(
  'groupExpenses/fetchGroupExpenses',
  async ({ groupId, page = 1, filters = {} }, thunkAPI) => {
    try {
      const params = new URLSearchParams({ page, ...filters }).toString()
      const res = await axios.get(`/api/groups/${groupId}/expenses?${params}`)
      return {
        expenses: res.data.expenses,
        page,
        hasMore: res.data.hasMore || res.data.expenses.length > 0,
      }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch group expenses')
    }
  }
)

// ➕ Add new group expense
export const addGroupExpense = createAsyncThunk(
  'groupExpenses/addGroupExpense',
  async ({ groupId, payload }, thunkAPI) => {
    try {
      const res = await axios.post(`/api/groups/${groupId}/add-expense`, payload)
      return res.data.expense
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to add group expense')
    }
  }
)

const groupExpensesSlice = createSlice({
  name: 'groupExpenses',
  initialState: {
    list: [],
    page: 1,
    hasMore: true,
    loading: false,
    error: null,
  },
  reducers: {
    resetGroupExpenses(state) {
      state.list = []
      state.page = 1
      state.hasMore = true
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupExpenses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupExpenses.fulfilled, (state, action) => {
        const { expenses, page, hasMore } = action.payload
        state.loading = false
        state.page = page
        state.hasMore = hasMore
        state.list = page === 1 ? expenses : [...state.list, ...expenses]
      })
      .addCase(fetchGroupExpenses.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(addGroupExpense.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
  }
})

export const { resetGroupExpenses } = groupExpensesSlice.actions
export default groupExpensesSlice.reducer
