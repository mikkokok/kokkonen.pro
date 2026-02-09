import {cn} from '../lib/utils';
import NavItem from './NavItem';
import {useIsAuthenticated} from '@azure/msal-react';
import {useLocation} from 'react-router-dom';
import {Home08Icon, Login02Icon, TemperatureIcon, ElectricHome01Icon} from '@hugeicons/core-free-icons';

const navItems = [
  {text: 'Home', path: '/', hidden: true, icon: Home08Icon},
  {text: 'Login', path: '/login', hidden: false, icon: Login02Icon},
  {text: 'Home heating', path: '/home-heating', hidden: true, icon: TemperatureIcon},
  {text: 'Electricity', path: '/electricity', hidden: true, icon: ElectricHome01Icon},
];

function NavigationBar() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  return (
    <div>
      <aside className={cn(
        "w-64 bg-gray-900",
        "border-r border-gray-800 flex flex-col pl-2 dark"
      )}>
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavItem hidden={item.hidden ? !isAuthenticated : false} route={item.path} routeName={item.text} isActive={location.pathname === item.path} icon={item.icon} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default NavigationBar;
