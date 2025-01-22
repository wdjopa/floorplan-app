export async function fetchFromApi(
  endpoint: string,
  companyId: string,
  accessToken: string
) {
  const response = await fetch(`${process.env.API_URL}/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Company": companyId,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data;
}
