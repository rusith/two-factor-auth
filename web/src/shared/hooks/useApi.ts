import { apiBaseUrl, tokenKey } from '@app/consts';

function getUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    authorization: `${localStorage.getItem(tokenKey)}`
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  const data = await response.json();
  throw new Error(data.error);
}

export function useApi() {
  return {
    get: async <T>(path: string) => {
      const response = await fetch(getUrl(path), {
        headers: getHeaders()
      });

      return handleResponse<T>(response);
    },
    post: async <T>(path: string, data: unknown) => {
      const response = await fetch(getUrl(path), {
        headers: getHeaders(),
        method: 'POST',
        body: JSON.stringify(data)
      });

      return handleResponse<T>(response);
    },

    delete: async <T>(path: string, data: unknown) => {
      const response = await fetch(getUrl(path), {
        headers: getHeaders(),
        method: 'DELETE'
      });

      return handleResponse<T>(response);
    }
  };
}
