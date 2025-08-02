import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// 🔄 Async thunk to fetch group settlements
export const fetchGroupSettlements = createAsyncThunk(
  'settlements/fetch',
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/groups/${groupId}/settlement`)
      console.log(res.data);
      
      return res.data.settlements
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch settlements')
    }
  }
)

const userSettlementSlice = createSlice({
  name: 'settlements',
  initialState: {
    settlements: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearGroupSettlements: (state) => {
      state.settlements = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupSettlements.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroupSettlements.fulfilled, (state, action) => {
        state.loading = false
        state.settlements = action.payload
      })
      .addCase(fetchGroupSettlements.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearGroupSettlements } = userSettlementSlice.actions
export default userSettlementSlice.reducer
