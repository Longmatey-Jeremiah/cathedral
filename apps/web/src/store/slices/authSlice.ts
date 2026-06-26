import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LoginResponse } from '@/shared/lib/types';

export type SessionUser = LoginResponse['user'];

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
}

interface AuthState {
  session: Session | null;
}

const initialState: AuthState = {
  session: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<Session>) => {
      state.session = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>,
    ) => {
      if (state.session) {
        state.session.accessToken = action.payload.accessToken;
        state.session.refreshToken = action.payload.refreshToken;
      }
    },
    clearSession: (state) => {
      state.session = null;
    },
  },
});

export const { setSession, setTokens, clearSession } = authSlice.actions;
export default authSlice.reducer;
