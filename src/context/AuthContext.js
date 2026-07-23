import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

import {fetchCurrentUser, login as loginRequest, logout as logoutRequest} from '../services/auth';

const AUTH_STORAGE_KEY = 'karpin-auth';

const AuthContext = React.createContext({
  bootstrapComplete: false,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  token: null,
  user: null,
});

function AuthProvider({children}) {
  const [authState, setAuthState] = React.useState({
    bootstrapComplete: false,
    token: null,
    user: null,
  });

  React.useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

        if (!storedAuth) {
          if (isMounted) {
            setAuthState(current => ({...current, bootstrapComplete: true}));
          }
          return;
        }

        const parsedAuth = JSON.parse(storedAuth);
        const response = await fetchCurrentUser(parsedAuth.token);

        if (isMounted) {
          setAuthState({
            bootstrapComplete: true,
            token: parsedAuth.token,
            user: response.user,
          });
        }
      } catch (error) {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

        if (isMounted) {
          setAuthState({
            bootstrapComplete: true,
            token: null,
            user: null,
          });
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = React.useCallback(async credentials => {
    const response = await loginRequest(credentials);
    const nextAuth = {
      token: response.token,
      user: response.user,
    };

    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));

    setAuthState({
      bootstrapComplete: true,
      token: response.token,
      user: response.user,
    });
  }, []);

  const logout = React.useCallback(async () => {
    const activeToken = authState.token;

    try {
      if (activeToken) {
        await logoutRequest(activeToken);
      }
    } catch (error) {
      // Local logout should still complete even if the API is unreachable.
    }

    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

    setAuthState({
      bootstrapComplete: true,
      token: null,
      user: null,
    });
  }, [authState.token]);

  const value = React.useMemo(
    () => ({
      bootstrapComplete: authState.bootstrapComplete,
      isAuthenticated: Boolean(authState.token && authState.user),
      login,
      logout,
      token: authState.token,
      user: authState.user,
    }),
    [authState.bootstrapComplete, authState.token, authState.user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return React.useContext(AuthContext);
}

export {AuthProvider, useAuth};
