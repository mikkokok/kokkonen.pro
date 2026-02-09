import {createContext, useContext, useEffect, useState, ReactNode, useMemo} from 'react';
import {getMsalInstance} from '../lib/auth/msal';
import {PublicClientApplication} from '@azure/msal-browser';
import {useIsAuthenticated} from '@azure/msal-react';

interface AuthContextType {
  isReady: boolean;
  msalInstance: PublicClientApplication | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [isReady, setIsReady] = useState(false);
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const instance = await getMsalInstance();
        setMsalInstance(instance);

        // Wait for authentication state and active account
        if (isAuthenticated) {
          const activeAccount = instance.getActiveAccount();
          if (activeAccount) {
            setIsReady(true);
          } else {
            // If authenticated but no active account, try to set it
            const accounts = instance.getAllAccounts();
            if (accounts.length > 0) {
              instance.setActiveAccount(accounts[0]);
              setIsReady(true);
            }
          }
        } else {
          // Not authenticated, but MSAL is ready
          setIsReady(true);
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        setIsReady(true); // Allow app to continue even if init fails
      }
    };

    void initializeMsal();
  }, [isAuthenticated]);

  const value = useMemo(() => ({
    isReady,
    msalInstance
  }), [isReady, msalInstance]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}