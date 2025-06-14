import {useAccount} from '@azure/msal-react';

function Home() {
  const account = useAccount();
  if (!account) {
    return <div>Please login first</div>;
  }
  return <div>Welcome!</div>;
}

export default Home;
