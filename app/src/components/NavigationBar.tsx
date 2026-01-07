import NavItem from './NavItem';
import { useIsAuthenticated } from '@azure/msal-react';
import { cn } from '../lib/tailwind';

const navItems = [
  { text: 'Home', path: '/', hidden: true },
  { text: 'Login', path: '/login', hidden: false },
  { text: 'Car Charging', path: '/car-charging', hidden: true },
  { text: 'Electricity', path: '/electricity', hidden: true },
];

function NavigationBar() {
  const isAuthenticated = useIsAuthenticated();
  return (
    <div>
      <aside className={cn(
        "w-64 bg-gray-900 text-gray-300",
        "border-r border-gray-800 flex flex-col"
      )}>
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavItem hidden={item.hidden ? !isAuthenticated : false} route={item.path} startIcon={null} routeName={item.text} />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default NavigationBar;
