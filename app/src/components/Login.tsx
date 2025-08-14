import {useAccount, useIsAuthenticated, useMsal} from '@azure/msal-react';
import {loginRequest} from '../lib/auth/msal';
import Button from '@mui/material/Button';

function Login() {
  const {instance} = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount();

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
    <div className="login-container">
      {isAuthenticated ? (
        <div>
          <p>You are logged in</p>
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <div>
          <p>Please log in to access the application.</p>
          <Button variant="contained" onClick={handleLogin}>
            Login
          </Button>
        </div>
      )}
    </div>
  );
}

export default Login;
