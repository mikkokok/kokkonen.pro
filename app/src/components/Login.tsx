import {useIsAuthenticated, useMsal} from '@azure/msal-react';
import {loginRequest} from '../lib/auth/msal';

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
    <div className="login-container" style={{marginTop: '20px', width: '100%'}}>
      {isAuthenticated ? (
        <div>
          <p>You are logged in</p>
          <button className="hover:text-white cursor-pointer p-2 rounded hover:bg-gray-800 transition" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div>
          <p>Please log in to access the application.</p>
          <button className="hover:text-white cursor-pointer p-2 rounded hover:bg-gray-800 transition" onClick={handleLogin}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
