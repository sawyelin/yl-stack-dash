// Cloudflare D1 API client

const CF_API_URL = import.meta.env.VITE_CF_API_URL || "";
const CF_API_TOKEN = import.meta.env.VITE_CF_API_TOKEN || "";

interface D1QueryOptions {
  database_id: string;
  query: string;
  params?: any[];
}

interface D1Response<T> {
  success: boolean;
  results?: T[];
  error?: string;
  meta?: any;
}

export async function queryD1<T>(
  query: string,
  params: any[] = [],
  database_id: string = import.meta.env.VITE_CF_DATABASE_ID || "",
): Promise<D1Response<T>> {
  if (!CF_API_URL || !CF_API_TOKEN || !database_id) {
    console.error("Cloudflare API credentials not configured");
    return { success: false, error: "API credentials not configured" };
  }

  try {
    const response = await fetch(`${CF_API_URL}/d1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CF_API_TOKEN}`,
      },
      body: JSON.stringify({
        database_id,
        query,
        params,
      } as D1QueryOptions),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return { success: true, results: data.results, meta: data.meta };
  } catch (error) {
    console.error("D1 query error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function executeD1<T>(
  query: string,
  params: any[] = [],
  database_id: string = import.meta.env.VITE_CF_DATABASE_ID || "",
): Promise<D1Response<T>> {
  if (!CF_API_URL || !CF_API_TOKEN || !database_id) {
    console.error("Cloudflare API credentials not configured");
    return { success: false, error: "API credentials not configured" };
  }

  try {
    const response = await fetch(`${CF_API_URL}/d1/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CF_API_TOKEN}`,
      },
      body: JSON.stringify({
        database_id,
        query,
        params,
      } as D1QueryOptions),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return { success: true, results: data.results, meta: data.meta };
  } catch (error) {
    console.error("D1 execute error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
