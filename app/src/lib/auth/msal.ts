import {AuthenticationResult, Configuration, LogLevel, PopupRequest, PublicClientApplication, SilentRequest} from '@azure/msal-browser';
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
      loggerCallback: (level: LogLevel, message: string, constainsPii: boolean) => {
        if (constainsPii) {
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
  return client;
}


let msalInstance: Promise<PublicClientApplication> | null = null;

export async function getMsalInstance(): Promise<PublicClientApplication> {
  if (!msalInstance) {
    msalInstance = initMsalInstance();

  }
  return msalInstance;
}

export async function getAuthResponse() {
  const silentRequest: SilentRequest = {
    scopes: apiScopes,
  };
  const msalInstance = await getMsalInstance();
  let response: AuthenticationResult | undefined;
  try {
    response = await msalInstance.acquireTokenSilent(silentRequest);
    if (!msalInstance.getActiveAccount()) {
      msalInstance.setActiveAccount(response.account);
    }
    msalInstance.setActiveAccount(response.account);
  } catch (error) {
    msalInstance.setActiveAccount(null);
    console.log('Silent token acquisition failed', error);
    throw error;
  }
  if (!response) {
    throw new Error('No active account found for authentication.');
  }
  return response;
};
