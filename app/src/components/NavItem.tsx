import {Button} from '@mui/material';
import {Link} from 'react-router-dom';

const NavItem: React.FC<{
  hidden: boolean;
  route: string;
  startIcon?: React.ReactNode;
  routeName: string;
}> = ({hidden, route, startIcon, routeName}) => {
  if (hidden) {
    return null;
  }
  return (
    <div>
      <Button fullWidth variant="contained" startIcon={startIcon} component={Link} to={route}>
        {routeName}
      </Button>
    </div>
  );
};

export default NavItem;
