import env from "../config/env.js";

export const generateEmailVerifyURL = ({ token, email }) => {
  try {
    const url = new URL(`${env.rootUri}/verify/email-token`);
    url.searchParams.append("token", token);
    url.searchParams.append("email", email);
    return url.toString();
  } catch (err) {
    return null;
  }
};
