import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'
import axios from 'axios'

export const fetchExpensesSummary = createAsyncThunk(
  'expensesSummary/fetch',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/api/dashboard/expense-summary')
      if (res.data.success) {
        return res.data.data}
      return thunkAPI.rejectWithValue(res.data.message || 'Failed to fetch')
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Request failed')
    }
  }
)

const expensesSummarySlice = createSlice({
  name: 'expensesSummary',
  initialState: {
    data: null,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpensesSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchExpensesSummary.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchExpensesSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        toast.error(action.payload)
      })
  }
})

export default expensesSummarySlice.reducer
