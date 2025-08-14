import {List, Box} from '@mui/material';
import NavItem from './NavItem';
import {useIsAuthenticated} from '@azure/msal-react';

const navItems = [
  {text: 'Home', path: '/', hidden: true},
  {text: 'Login', path: '/login', hidden: false},
  {text: 'Car Charging', path: '/car-charging', hidden: true},
  {text: 'Electricity', path: '/electricity', hidden: true},
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
          <NavItem key={item.path} hidden={item.hidden ? !isAuthenticated : false} route={item.path} startIcon={null} routeName={item.text} />
        ))}
      </List>
    </Box>
  );
}

export default NavigationBar;
