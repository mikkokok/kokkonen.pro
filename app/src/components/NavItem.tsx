import {cn} from '../lib/utils';
import {Link} from 'react-router-dom';
import {HugeiconsIcon, IconSvgElement} from '@hugeicons/react';

const NavItem: React.FC<{
  hidden: boolean;
  route: string;
  routeName: string;
  isActive?: boolean;
  icon?: IconSvgElement;
}> = ({hidden, route, routeName, isActive, icon}) => {
  if (hidden) {
    return null;
  }
  return (
    <Link to={route} className="w-full">
      <button className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all w-full text-left",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "bg-muted text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-primary text-white"
      )}>
        {icon && <HugeiconsIcon icon={icon} className="h-5 w-5" />}
        <span>
          {routeName}
        </span>
      </button>
    </Link>
  );
};

export default NavItem;
