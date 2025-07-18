import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Async thunk to fetch group expense summary
export const fetchGroupExpenseSummary = createAsyncThunk(
  'groupExpenseSummary/fetchGroupExpenseSummary',
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/expense-summary`)
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch group expense summary'
      )
    }
  }
)

const groupExpenseSummarySlice = createSlice({
  name: 'groupExpenseSummary',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearGroupExpenseSummary(state) {
      state.data = null
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupExpenseSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupExpenseSummary.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchGroupExpenseSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearGroupExpenseSummary } = groupExpenseSummarySlice.actions
export default groupExpenseSummarySlice.reducer
