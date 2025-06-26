export const fetchWithRefresh = async (input: RequestInfo, init?: RequestInit) => {
  const response = await fetch(input, { ...init, credentials: 'include' });

  if (response.status === 401) {
    // handle refresh logic here
  }

  return response;
};
