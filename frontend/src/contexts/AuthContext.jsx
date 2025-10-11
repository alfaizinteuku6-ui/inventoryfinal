import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { auth } from "../services/api";
import { useAuthUser } from "../hooks/useSWR";

// Constants
const TOKEN_STORAGE_KEY = "access_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

export const AuthContext = createContext();

// Utility functions
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};

const shouldRefreshToken = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = (payload.exp - currentTime) * 1000;
    return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
  } catch {
    return false;
  }
};

const clearTokens = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoading: true,
    error: null,
    isInitialized: false
  });

  const [refreshPromise, setRefreshPromise] = useState(null);

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const {
    data: user,
    error: userError,
    isLoading: userLoading,
    mutate: refetchUser
  } = useAuthUser(token ? true : false); // Only fetch if token exists

  // Initialize auth state
  useEffect(() => {
    const initialize = () => {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!token || isTokenExpired(token)) {
        clearTokens();
        setAuthState({
          isLoading: false,
          error: null,
          isInitialized: true
        });
        return;
      }

      setAuthState({
        isLoading: false,
        error: null,
        isInitialized: true
      });
    };

    initialize();
  }, []);

  // Token refresh
  const refreshToken = useCallback(async () => {
    if (refreshPromise) return refreshPromise;

    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshTokenValue) throw new Error("No refresh token available");

    const promise = (async () => {
      try {
        const response = await auth.refresh({ refresh: refreshTokenValue });
        const { access, refresh: newRefresh } = response.data;

        localStorage.setItem(TOKEN_STORAGE_KEY, access);
        if (newRefresh) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefresh);

        await refetchUser(); // Re-fetch user from API

        return access;
      } catch (error) {
        clearTokens();
        setAuthState(prev => ({
          ...prev,
          error: "Session expired. Please login again."
        }));
        throw error;
      } finally {
        setRefreshPromise(null);
      }
    })();

    setRefreshPromise(promise);
    return promise;
  }, [refreshPromise, refetchUser]);

  // Auto refresh
  useEffect(() => {
    if (!authState.isInitialized || !token) return;

    const checkAndRefresh = async () => {
      if (shouldRefreshToken(token)) {
        try {
          await refreshToken();
        } catch {
          // Do nothing, handled in refreshToken
        }
      }
    };

    checkAndRefresh();
    const interval = setInterval(checkAndRefresh, 60000); // every 1 min
    return () => clearInterval(interval);
  }, [authState.isInitialized, token, refreshToken]);

  const login = useCallback(async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await auth.login(credentials);
      const { access, refresh } = response.data;

      if (!access || !refresh || isTokenExpired(access)) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, access);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh);

      await refetchUser();

      setAuthState({
        isLoading: false,
        error: null,
        isInitialized: true
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Login failed";
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
      throw new Error(errorMessage);
    }
  }, [refetchUser]);

  const logout = useCallback(async (force = false) => {
    try {
      if (!force) {
        const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
        if (refreshTokenValue) {
          try {
            await auth.logout({ refresh: refreshTokenValue });
          } catch (err) {
            console.warn("Logout API failed, clearing anyway");
          }
        }
      }

      clearTokens();
      setRefreshPromise(null);
      setAuthState({
        isLoading: false,
        error: null,
        isInitialized: true
      });
      await refetchUser(); // Clear cached user
    } catch {
      clearTokens();
      setRefreshPromise(null);
    }
  }, [refetchUser]);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const getValidToken = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token || isTokenExpired(token)) {
      await refreshToken();
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    }

    if (shouldRefreshToken(token)) {
      try {
        await refreshToken();
        return localStorage.getItem(TOKEN_STORAGE_KEY);
      } catch {
        return token;
      }
    }

    return token;
  }, [refreshToken]);

  const contextValue = useMemo(() => ({
    user,
    isLoading: authState.isLoading || userLoading,
    error: authState.error || userError,
    isAuthenticated: !!user,
    isInitialized: authState.isInitialized,

    login,
    logout,
    clearError,
    getValidToken,
    refreshToken,
    forceLogout: () => logout(true)
  }), [
    user,
    userLoading,
    userError,
    authState,
    login,
    logout,
    clearError,
    getValidToken,
    refreshToken
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
