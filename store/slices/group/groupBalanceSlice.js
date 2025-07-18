import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import toast from 'react-hot-toast'

// Async thunk to fetch group balance summary
export const fetchGroupBalanceSummary = createAsyncThunk(
  'groupBalance/fetchGroupBalanceSummary',
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/balance-summary`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch group balance summary')
      }
      return data.data 
    } catch (err) {
      toast.error(err.message)
      return rejectWithValue(err.message)
    }
  }
)

const groupBalanceSlice = createSlice({
  name: 'groupBalance',
  initialState: {
    loading: false,
    error: null,
    summary: null, // groupId -> summary object
  },
  reducers: {
    resetGroupBalanceSummary: (state) => {
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
        state.error = action.payload || 'Something went wrong'
      })
  },
})

export default groupBalanceSlice.reducer
