// /store/slices/analyticsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

export const fetchAnalytics = createAsyncThunk(
  'analytics/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/dashboard/analytics')
      // console.log("Analytics Data:", res.data.data);
      return res.data.data
    } catch (err) {
      toast.error('Failed to load analytics')
      return rejectWithValue(err.response?.data?.message || 'Error')
    }
  }
)

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default analyticsSlice.reducer
