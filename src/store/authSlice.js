import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = "/api";

// Helper to check if user is authenticated (has session cookie)
const checkAuth = () => {
  if (typeof window !== "undefined") {
    // Check if session cookie exists
    return document.cookie.includes("session=");
  }
  return false;
};

// Async thunks
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Registration failed"
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/auth/login`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Login failed");
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (forceRefresh = false, { rejectWithValue, getState }) => {
    try {
      // Check if user data is already fresh (less than 5 minutes old) and not forced
      const state = getState();
      const lastFetch = state.auth.lastUserFetch;
      const now = Date.now();

      if (
        !forceRefresh &&
        state.auth.user &&
        lastFetch &&
        now - lastFetch < 5 * 60 * 1000
      ) {
        // Return existing user data if fresh
        return state.auth.user;
      }

      const response = await axios.get(`${API}/auth/me`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to get user"
      );
    }
  }
);

// New action for immediate profile updates
export const updateUserProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.put(`${API}/auth/profile`, profileData);

      // Force refresh user data to get the latest from server
      await dispatch(getCurrentUser(true));

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.detail || "Profile update failed"
      );
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(`${API}/auth/logout`);
      return {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || "Logout failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: checkAuth(),
    lastUserFetch: null,
  },
  reducers: {
    logout: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Register
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false; // User needs to login after registration
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get current user
      .addCase(getCurrentUser.pending, state => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.lastUserFetch = Date.now();
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        // Don't automatically log out user on getCurrentUser failure
        // Only set error, keep authentication state
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, state => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Update profile
      .addCase(updateUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // User data will be refreshed by getCurrentUser call inside the thunk
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
