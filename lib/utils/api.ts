// Helper functions for API calls
export async function fetchWithError(url: string, options?: RequestInit) {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  }