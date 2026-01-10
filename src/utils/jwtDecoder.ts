// JWT tokens should only be validated server-side
// Client-side decoding is insecure and should not be used for authentication
// This utility is deprecated and kept only for backward compatibility

const decodeJwt = (token: string): any => {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(base64Payload);
    return JSON.parse(jsonPayload);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Failed to decode token", err);
    }
    return null;
  }
};

export default decodeJwt;