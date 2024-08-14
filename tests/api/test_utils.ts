type RequestMethod = "POST" | "GET" | "DELETE" | "PUT" | "PATCH"

interface FetchData {
  url: string;
  request_body?: object;
  method: RequestMethod;
};

interface FetchResponse {
  status: number;
  json: object;
  headers: Headers;
};

class TestUtils {

  public static async FetchJSON(data: FetchData): Promise<FetchResponse> {
   
    const response = await fetch(data.url, {
      method: data.method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data.request_body)
    });

    return {
      status: response.status,
      json: await response.json(),
      headers: response.headers
    }
  };
  
};

export default TestUtils;
