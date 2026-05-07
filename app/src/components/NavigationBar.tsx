import {cn} from '../lib/utils';
import NavItem from './NavItem';
import {useIsAuthenticated} from '@azure/msal-react';
import {useLocation} from 'react-router-dom';
import {Home08Icon, Login02Icon, TemperatureIcon, ElectricHome01Icon, ChipIcon} from '@hugeicons/core-free-icons';

const navItems = [
  {text: 'Home', path: '/', hidden: true, icon: Home08Icon},
  {text: 'Home heating', path: '/home-heating', hidden: true, icon: TemperatureIcon},
  {text: 'Electricity', path: '/electricity', hidden: true, icon: ElectricHome01Icon},
  {text: 'Devices', path: '/devices', hidden: true, icon: ChipIcon},
  {text: 'Login', path: '/login', hidden: false, icon: Login02Icon},
];

function NavigationBar() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  return (
    <div>
      <aside
        className={cn(
          "bg-gray-900",
          "w-full md:w-64",
          "border-b md:border-b-0 md:border-r border-gray-800",
          "flex flex-col pl-2 dark"
        )}
      >
        <nav className="flex-1 p-2 md:p-4">
          <ul className="flex gap-2 overflow-x-auto md:block md:space-y-4 md:overflow-visible">
            {navItems.map((item) => (
              <li key={item.path} className="shrink-0 md:shrink">
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
