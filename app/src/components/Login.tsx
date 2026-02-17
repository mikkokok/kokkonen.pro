import {useIsAuthenticated} from '@azure/msal-react';
import {useMsal} from '@azure/msal-react';
import {InteractionStatus} from '@azure/msal-browser';
import {loginPopupRequest, loginRedirectRequest} from '../lib/auth/msal';
import {Button} from "./ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';

function isLikelyMobileBrowser(): boolean {
  const ua = navigator.userAgent ?? '';
  const isIpadOs = /Macintosh/i.test(ua) && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod/i.test(ua) || isIpadOs;
}

function Login() {
  const {instance, inProgress} = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = async () => {
    if (inProgress !== InteractionStatus.None) return;
    try {
      if (isLikelyMobileBrowser()) {
        await instance.loginRedirect(loginRedirectRequest);
        return;
      }

      const res = await instance.loginPopup(loginPopupRequest);
      if (res.account) {
        instance.setActiveAccount(res.account);
      }
    } catch (error) {
      console.log('Login popup failed, falling back to redirect:', error);
      await instance.loginRedirect(loginRedirectRequest);
    }
  };

  const handleLogout = async () => {
    if (inProgress !== InteractionStatus.None) return;
    try {
      if (isLikelyMobileBrowser()) {
        await instance.logoutRedirect({postLogoutRedirectUri: window.location.origin});
        return;
      }

      await instance.logoutPopup({mainWindowRedirectUri: '/'});
      instance.setActiveAccount(null);
    } catch (error) {
      console.log('Logout failed:', error);
    }
  };

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
