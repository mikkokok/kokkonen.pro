import {Configuration, LogLevel, PopupRequest, PublicClientApplication} from '@azure/msal-browser';
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

export function getMsalInstance(): PublicClientApplication {
  return new PublicClientApplication(msalConfig);
}

export const loginRequest: PopupRequest = {
  scopes: apiScopes,
};

export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
