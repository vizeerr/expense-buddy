import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

export const fetchBudgetSummary = createAsyncThunk(
  'budgetSummary/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/dashboard/budget-summary')
      return res.data.data
    } catch (err) {
      toast.error('Failed to load budget summary')
      return rejectWithValue(err.response?.data?.message || 'Error')
    }
  }
)

const budgetSummarySlice = createSlice({
  name: 'budgetSummary',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgetSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchBudgetSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default budgetSummarySlice.reducer
