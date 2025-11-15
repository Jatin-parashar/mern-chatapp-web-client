const decodeJwt = (token: string): any => {
  try {
    const base64Payload = token.split(".")[1];
    const jsonPayload = atob(base64Payload);
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

export default decodeJwt;