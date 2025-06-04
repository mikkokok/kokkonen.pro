import {List, Box} from '@mui/material';
import NavItem from './NavItem';
import {useIsAuthenticated} from '@azure/msal-react';

const navItems = [
  {text: 'Home', path: '/'},
  {text: 'Car Charging', path: '/car-charging'},
  {text: 'Electricity', path: '/electricity'},
];

function NavigationBar() {
  const isAuthenticated = useIsAuthenticated();
  return (
    <Box
      sx={{
        width: 150,
      }}
    >
      <List sx={{paddingTop: 0, paddingBottom: 0}}>
        {navItems.map((item) => (
          <NavItem key={item.path} hidden={!isAuthenticated} route={item.path} startIcon={null} routeName={item.text} />
        ))}
      </List>
    </Box>
  );
}

export default NavigationBar;
