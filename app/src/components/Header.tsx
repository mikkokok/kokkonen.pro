import {useAccount} from '@azure/msal-react';
import {AppBar, Box, Toolbar, Typography} from '@mui/material';

function Header() {
  const account = useAccount();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
          Kokkonen.pro home dashboard
        </Typography>
      </Toolbar>
      <Toolbar sx={{justifyContent: 'space-between'}}>
        <Box>{account && <p>Hello {account.name}</p>}</Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
