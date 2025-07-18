import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Async thunk to fetch group analytics
export const fetchGroupAnalytics = createAsyncThunk(
  'groupAnalytics/fetchGroupAnalytics',
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/analytics`)
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch group analytics')
    }
  }
)

const groupAnalyticsSlice = createSlice({
  name: 'groupAnalytics',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearGroupAnalytics: (state) => {
      state.data = null
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupAnalytics.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupAnalytics.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchGroupAnalytics.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearGroupAnalytics } = groupAnalyticsSlice.actions
export default groupAnalyticsSlice.reducer
