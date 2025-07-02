// store/slices/balanceSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

export const fetchBalanceSummary = createAsyncThunk(
  'balance/fetchBalanceSummary',
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch('/api/dashboard/balance-summary')
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch balance summary')
      }

      return data.data
    } catch (err) {
      toast.error(err.message)
      return rejectWithValue(err.message)
    }
  }
)

const balanceSlice = createSlice({
  name: 'balance',
  initialState: {
    loading: false,
    error: null,
    summary: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBalanceSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBalanceSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(fetchBalanceSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default balanceSlice.reducer
