import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Async thunk to fetch group by ID
export const fetchGroupDetail = createAsyncThunk(
  'groupDetail/fetchGroupDetail',
  async (groupId, thunkAPI) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/details`)
      return res.data.group
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch group detail')
    }
  }
)

const groupDetailSlice = createSlice({
  name: 'groupDetail',
  initialState: {
    group: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearGroupDetail(state) {
      state.group = null
      state.loading = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupDetail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupDetail.fulfilled, (state, action) => {
        state.loading = false
        state.group = action.payload
      })
      .addCase(fetchGroupDetail.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearGroupDetail } = groupDetailSlice.actions
export default groupDetailSlice.reducer
