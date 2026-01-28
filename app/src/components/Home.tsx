import {Link} from "react-router-dom";
import {getMsalInstance} from "../lib/auth/msal";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {Button} from "./ui/button";
import {useEffect, useState} from "react";
import {PublicClientApplication} from "@azure/msal-browser";

function Home() {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);

  useEffect(() => {
    const initMsal = async () => {
      const instance = await getMsalInstance();
      setMsalInstance(instance);
    };
    void initMsal();
  }, []);

  // Use msalInstance only after it's initialized
  if (!msalInstance) {
    return <div>Loading...</div>;
  }
  const account = msalInstance.getActiveAccount();

  if (!account) {
    return (
      <div className="items-center h-full p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please login to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Link to="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {account.name || account.username}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your home today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of your home</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
