import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Fetch groups the current user is part of
export const fetchGroups = createAsyncThunk(
  'groups/fetchGroups',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/api/groups/get-groups')
      console.log(res);
      
      return res.data.groups || []
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to fetch groups')
    }
  }
)

// ✅ Add a new group
export const createGroup = createAsyncThunk(
  'groups/createGroup',
  async (groupData, thunkAPI) => {
    try {
      const res = await axios.post('/api/groups/create-group', groupData)
      return res.data.group
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'Failed to create group')
    }
  }
)

const groupsSlice = createSlice({
  name: 'groups',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetGroups(state) {
      state.list = []
      state.loading = false
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(createGroup.fulfilled, (state, action) => {
        state.list.unshift(action.payload)
      })
  }
})

export const { resetGroups } = groupsSlice.actions
export default groupsSlice.reducer
