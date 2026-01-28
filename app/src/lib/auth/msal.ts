import {AuthenticationResult, Configuration, LogLevel, PopupRequest, PublicClientApplication, SilentRequest} from '@azure/msal-browser';
import {apiScopes, clientId, msalAuthority} from '../../config/config';

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: msalAuthority,
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

let msalInstance: PublicClientApplication | null = null;

export function getMsalInstance(): PublicClientApplication {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
}

export async function getAuthResponse() {
  const silentRequest: SilentRequest = {
    scopes: apiScopes,
  };
  const msalInstance = getMsalInstance();
  let response: AuthenticationResult | undefined;
  try {
    response = await msalInstance.acquireTokenSilent(silentRequest);
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
