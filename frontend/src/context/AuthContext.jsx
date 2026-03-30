/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { loginRequest, registerRequest, setAccessToken } from "../api/api";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
} from "../utils/constants";

const AuthContext = createContext(null);

function readStoredAuth() {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  const user = rawUser ? JSON.parse(rawUser) : null;

  if (!access || !refresh || !user) {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    };
  }

  return {
    accessToken: access,
    refreshToken: refresh,
    user,
  };
}

export function AuthProvider({ children }) {
  const initial = readStoredAuth();
  const [accessToken, setAccessTokenState] = useState(initial.accessToken);
  const [refreshToken, setRefreshTokenState] = useState(initial.refreshToken);
  const [user, setUser] = useState(initial.user);

  const isAuthenticated = Boolean(accessToken);

  const persistAuth = useCallback(({ access, refresh, user: payloadUser }) => {
    setAccessTokenState(access);
    setRefreshTokenState(refresh);
    setUser(payloadUser);

    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(payloadUser));
    setAccessToken(access);
  }, []);

  const clearAuth = useCallback(() => {
    setAccessTokenState(null);
    setRefreshTokenState(null);
    setUser(null);

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
  }, []);

  const login = useCallback(
    async ({ username, password }) => {
      const result = await loginRequest({ username, password });
      persistAuth(result);
      return result;
    },
    [persistAuth],
  );

  const register = useCallback(
    async ({ username, email, password, student_id }) => {
      const result = await registerRequest({
        username,
        email,
        password,
        student_id,
      });
      persistAuth(result);
      return result;
    },
    [persistAuth],
  );

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated,
      login,
      register,
      logout: clearAuth,
    }),
    [
      accessToken,
      clearAuth,
      isAuthenticated,
      login,
      refreshToken,
      register,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
