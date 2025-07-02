import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Async thunk to fetch group budget summary
export const fetchGroupBudgetSummary = createAsyncThunk(
  'groupBudget/fetchGroupBudgetSummary',
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/budget-summary`)
      return res.data.data
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch group budget summary')
    }
  }
)

const groupBudgetSummarySlice = createSlice({
  name: 'groupBudget',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearGroupBudgetSummary: (state) => {
      state.data = null
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupBudgetSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupBudgetSummary.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchGroupBudgetSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearGroupBudgetSummary } = groupBudgetSummarySlice.actions
export default groupBudgetSummarySlice.reducer
