import { useAccount } from '@azure/msal-react';
import { cn } from '../lib/tailwind';

function Header() {
  const account = useAccount();

  return (
    <header className={cn(
      "bg-gray-900 text-white p-4 border-b border-gray-800",
      "flex justify-between items-center h-16"
    )}>
      <h1 className="text-xl font-bold text-blue-400">Kokkonen.pro home dashboard</h1>
      <div className="flex gap-4">
        <p className="hover:text-blue-400 transition-colors">{account && <p>Hello {account.name}</p>}</p>

      </div>
    </header>
  );
}

export default Header;
