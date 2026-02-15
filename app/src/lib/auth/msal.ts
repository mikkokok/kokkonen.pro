import {
  AuthenticationResult,
  Configuration,
  EventMessage,
  EventType,
  LogLevel,
  PopupRequest,
  PublicClientApplication,
  SilentRequest,
} from '@azure/msal-browser';
import {apiScopes, clientId, msalAuthority} from '../../config/config';

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: msalAuthority,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
    },
  },
};


export const loginRequest: PopupRequest = {
  scopes: apiScopes,
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

async function initMsalInstance(): Promise<PublicClientApplication> {
  const client = new PublicClientApplication(msalConfig);
  await client.initialize();

  try {
    const redirectResult = await client.handleRedirectPromise();
    if (redirectResult?.account) {
      client.setActiveAccount(redirectResult.account);
    }
  } catch (error) {
    console.log('MSAL redirect handling failed', error);
  }

  client.addEventCallback((message: EventMessage) => {
    const payload = message.payload as AuthenticationResult | undefined;
    if (!payload?.account) return;

    switch (message.eventType) {
      case EventType.LOGIN_SUCCESS:
      case EventType.ACQUIRE_TOKEN_SUCCESS:
        client.setActiveAccount(payload.account);
        return;
      default:
        return;
    }
  });

  if (!client.getActiveAccount()) {
    const accounts = client.getAllAccounts();
    if (accounts.length > 0) {
      client.setActiveAccount(accounts[0]);
    }
  }

  return client;
}


let msalInstancePromise: Promise<PublicClientApplication> | null = null;

export function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstancePromise) {
    msalInstancePromise = initMsalInstance();
  }
  return msalInstancePromise;
}

export async function getAuthResponse() {
  const msalInstance = await getMsalInstance();
  const account = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0] ?? null;
  if (!account) {
    throw new Error('No signed-in account found.');
  }

  const silentRequest: SilentRequest = {
    scopes: apiScopes,
    account,
  };

  let response: AuthenticationResult | undefined;
  try {
    response = await msalInstance.acquireTokenSilent(silentRequest);
    msalInstance.setActiveAccount(response.account);
  } catch (error) {
    console.log('Silent token acquisition failed', error);
    throw error;
  }
  if (!response) {
    throw new Error('No active account found for authentication.');
  }
  return response;
}
