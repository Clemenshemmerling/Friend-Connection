import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from 'types/types';

interface UserState {
  users: User[];
  status: 'idle' | 'loading' | 'failed';
}

const initialState: UserState = {
  users: [],
  status: 'idle',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setStatus: (state, action: PayloadAction<'idle' | 'loading' | 'failed'>) => {
      state.status = action.payload;
    },
  },
});

export const { setUsers, setStatus } = userSlice.actions;

export default userSlice.reducer;
