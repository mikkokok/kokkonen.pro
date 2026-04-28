import {getAuthResponse} from './auth/msal';

export async function patchAuthHeaders(request: Request): Promise<void> {
    const authResult = await getAuthResponse();
    if (!authResult.accessToken) {
        throw new Error('No access token available for authenticated request.');
    }

    request.headers.set('Authorization', `Bearer ${authResult.accessToken}`);

    const isJsonMethod = request.method !== 'GET' && request.method !== 'HEAD';
    if (isJsonMethod && request.body) {
        request.headers.set('Content-Type', 'application/json');
    }
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