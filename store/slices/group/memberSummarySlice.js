import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 🔄 Async thunk to fetch group member summary
export const fetchGroupMemberSummary = createAsyncThunk(
  'memberSummary/fetch',
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/member-summary`)
      return res.data.members
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch member summary')
    }
  }
)

const memberSummarySlice = createSlice({
  name: 'memberSummary',
  initialState: {
    members: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMemberSummary: (state) => {
      state.members = []
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupMemberSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupMemberSummary.fulfilled, (state, action) => {
        state.loading = false
        state.members = action.payload
      })
      .addCase(fetchGroupMemberSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearMemberSummary } = memberSummarySlice.actions
export default memberSummarySlice.reducer
