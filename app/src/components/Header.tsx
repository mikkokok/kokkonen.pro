import {useMsal, useIsAuthenticated, useAccount} from '@azure/msal-react';
import {AppBar, Box, Button, Toolbar, Typography} from '@mui/material';
import {loginRequest} from '../lib/auth/msal';

function Header() {
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
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
          Kokkonen.pro home dashboard
        </Typography>
      </Toolbar>
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <Box>{account && <p>Hello {account.name}</p>}</Box>
        <Box>
          {isAuthenticated ? (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
