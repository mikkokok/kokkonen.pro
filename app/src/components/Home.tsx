import {Link} from "react-router-dom";
import {getMsalInstance} from "../lib/auth/msal";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "./ui/card";
import {Button} from "./ui/button";
import {useEffect, useMemo, useState} from "react";
import {PublicClientApplication} from "@azure/msal-browser";
import {backendUrl} from "../config/config";
import {HeatHarmonyClient} from "../lib/heatHarmony/heatHarmonyClient";
import {OumanLatestResponse} from "../lib/heatHarmony/validation/oumanLatestResponse";
import {TemperatureIcon} from "@hugeicons/core-free-icons";
import {HugeiconsIcon} from '@hugeicons/react';
import {useCallback} from "react";

function Home() {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);
  const [oumanLatest, setOumanLatest] = useState<OumanLatestResponse | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      const oumanLatestData = await heatHarmonyClient.getOumanLatestData();
      setOumanLatest(oumanLatestData);
    } catch (error) {
      console.error("Error fetching latest data:", error);
    }
  }, [heatHarmonyClient]);

  useEffect(() => {
    const initMsal = async () => {
      const instance = await getMsalInstance();
      setMsalInstance(instance);
    };
    void initMsal();
  }, []);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

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
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outside Temp</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanLatest?.outsideTemp?.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inside Temp</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanLatest?.insideTemp?.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">
              Target: {oumanLatest?.insideTempDemand?.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
