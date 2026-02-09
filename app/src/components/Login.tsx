import {useIsAuthenticated} from '@azure/msal-react';
import {getMsalInstance, loginRequest} from '../lib/auth/msal';
import {Button} from "./ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {useEffect, useState} from 'react';
import {PublicClientApplication} from '@azure/msal-browser';

function Login() {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const initMsal = async () => {
      const msalInstance = await getMsalInstance();
      setInstance(msalInstance);
    };
    void initMsal();
  }, []);

  const handleLogin = async () => {
    if (!instance) return;
    try {
      const res = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(res.account);
    } catch (error) {
      console.log('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    if (!instance) return;
    try {
      await instance.logoutPopup({mainWindowRedirectUri: '/'});
      instance.setActiveAccount(null);
    } catch (error) {
      console.log('Logout failed:', error);
    }
  };

  if (!instance) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center p-6 dark">
      <Card className="w-full max-w-md">
        {isAuthenticated ? (
          <>
            <CardHeader>
              <CardTitle>Logged In</CardTitle>
              <CardDescription>You are currently authenticated</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={handleLogout}>
                Logout
              </Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Please log in to access the application</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={handleLogin}>
                Login
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

export default Login;
