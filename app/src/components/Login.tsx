import {useIsAuthenticated, useMsal} from '@azure/msal-react';
import {loginRequest} from '../lib/auth/msal';
import { Button } from "@/components/ui/button"

function Login() {
  const {instance} = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const handleLogin = async () => {
    try {
      const res = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(res.account);
    } catch (error) {
      console.log('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({mainWindowRedirectUri: '/'});
      instance.setActiveAccount(null);
    } catch (error) {
      console.log('Logout failed:', error);
    }
  };

  return (
    <div className="login-container mt-5, w-full">
      {isAuthenticated ? (
        <div>
          <p>You are logged in</p>
          <Button variant='outline' onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <div>
          <p>Please log in to access the application.</p>
          <Button  onClick={handleLogin}>
            Login
          </Button>
        </div>
      )}
    </div>
  );
}

export default Login;
