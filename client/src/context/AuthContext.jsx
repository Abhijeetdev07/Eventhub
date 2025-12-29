import { createContext, useEffect, useMemo, useState } from 'react';

import { clearToken, getToken, setToken } from '../utils/authStorage';
import { clearStoredUser, getStoredUser, setStoredUser } from '../utils/userStorage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUserState] = useState(getStoredUser());

  useEffect(() => {
    if (token) {
      setToken(token);
    } else {
      clearToken();
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      setStoredUser(user);
    } else {
      clearStoredUser();
    }
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setAuthToken: (newToken) => setTokenState(newToken),
      setUser: (newUser) => setUserState(newUser),
      logout: () => {
        setTokenState(null);
        setUserState(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
