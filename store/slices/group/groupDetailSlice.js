import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Async thunk to fetch group details
export const fetchGroupDetails = createAsyncThunk(
  'groupDetail/fetchGroupDetails',
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/get-details`)
      return res.data
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Failed to fetch group details'
      )
    }
  }
)

const groupDetailSlice = createSlice({
  name: 'groupDetail',
  initialState: {
    group: null,
    expenses: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetGroupDetails(state) {
      state.group = null
      state.expenses = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupDetails.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupDetails.fulfilled, (state, action) => {
        state.loading = false
        state.group = action.payload.group
        state.expenses = action.payload.expenses || []
      })
      .addCase(fetchGroupDetails.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { resetGroupDetails } = groupDetailSlice.actions
export default groupDetailSlice.reducer
