import {ReactNode} from 'react';
import {Navigate} from 'react-router-dom';
import {useMsal} from '@azure/msal-react';
import {InteractionStatus} from '@azure/msal-browser';

export default function RequireAuth({children}: {children: ReactNode}) {
  const {accounts, inProgress} = useMsal();

  if (inProgress !== InteractionStatus.None) {
    return <div>Loading...</div>;
  }

  if (accounts.length === 0) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
