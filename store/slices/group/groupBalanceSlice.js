import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Async thunk to fetch group balance summary
export const fetchGroupBalanceSummary = createAsyncThunk(
  'groupBalance/fetchGroupBalanceSummary',
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/balance-summary`)
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch group balance'
      )
    }
  }
)

const groupBalanceSlice = createSlice({
  name: 'groupBalance',
  initialState: {
    summary: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearGroupBalanceSummary(state) {
      state.summary = null
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupBalanceSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupBalanceSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
      })
      .addCase(fetchGroupBalanceSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearGroupBalanceSummary } = groupBalanceSlice.actions
export default groupBalanceSlice.reducer
