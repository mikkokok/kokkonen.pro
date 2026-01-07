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
    <Link to={route} className="w-full">
      <button className="hover:text-white cursor-pointer rounded hover:bg-gray-800 transition">
        {startIcon}
        {routeName}
      </button>
    </Link>
  );
};

export default NavItem;
