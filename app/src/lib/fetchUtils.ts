import {getAuthResponse} from "./auth/msal";

export async function patchAuthHeaders(request: Request): Promise<boolean> {
    const authResult = await getAuthResponse();
    if (authResult.accessToken) {
        request.headers.set('Authorization', `Bearer ${authResult.accessToken}`);
    }
    else {
        return false;
    }
    if (request.body) {
        request.headers.set('Content-Type', 'application/json');
    }
    return true;
}

export async function handleFetchErrors(response: Response): Promise<void> {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
}

export async function handleFetch(request: Request): Promise<Response> {
    await patchAuthHeaders(request);
    const response = await fetch(request);
    await handleFetchErrors(response);
    return response;
}