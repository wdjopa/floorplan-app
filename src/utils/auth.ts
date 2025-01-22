export async function verifyHmac(
  params: Record<string, string>,
  clientSecret: string
): Promise<boolean> {
  // Get received HMAC and remove it from params
  const { hmac: receivedHmac, ...restParams } = params;

  // Sort parameters alphabetically
  const sortedParams = Object.keys(restParams)
    .sort()
    .reduce((acc, key) => {
      acc[key] = restParams[key];
      return acc;
    }, {} as Record<string, string>);

  // Build query string
  const queryString = new URLSearchParams(sortedParams).toString();

  // Calculate HMAC with SHA256
  const encoder = new TextEncoder();
  const key = encoder.encode(clientSecret);
  const message = encoder.encode(queryString);

  const calculatedHmac = await crypto.subtle
    .importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
    .then((key) => crypto.subtle.sign("HMAC", key, message))
    .then((signature) =>
      Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
    );

  return calculatedHmac === receivedHmac;
}
