import {
  ACCESS_TOKEN_EXPIRY,
  MILI_PER_SEC,
  REFRESH_TOKEN_EXPIRY,
} from "../config/const.js";
import { signToken } from "./token.js";

export const validate_login_with_cookies = async (
  res,
  { userData, sessionData }
) => {
  try {
    const accessToken = signToken(
      {
        name: userData.name,
        userName: userData.userName,
        email: userData.email,
        isVerified: userData.isVerified,
        sessionId: sessionData.id,
      },
      ACCESS_TOKEN_EXPIRY / MILI_PER_SEC
    );

    const refreshToken = signToken(
      { sessionId: sessionData.id },
      REFRESH_TOKEN_EXPIRY / MILI_PER_SEC
    );

    const baseCookieConfig = {
      httpOnly: true,
      secure: true,
    };

    res.cookie("access_token", accessToken, {
      ...baseCookieConfig,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });

    res.cookie("refresh_token", refreshToken, {
      ...baseCookieConfig,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    return accessToken;
  } catch (err) {
    return console.error("Error in signing dual auth");
  }
};
