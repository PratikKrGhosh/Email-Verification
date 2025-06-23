// importing all modules and files
import { getSessionById } from "../services/session.service.js";
import { getUserById } from "../services/user.services.js";
import { validate_login_with_cookies } from "../utils/cookie.js";
import { verifyToken } from "../utils/token.js";

const authMiddleware = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  // if access token exists
  if (accessToken) {
    const decodedAccessToken = verifyToken(accessToken);
    req.user = decodedAccessToken;
    return next();
  }

  // if refresh token exists and its valid but not access token
  if (refreshToken) {
    const decodedRefreshToken = verifyToken(refreshToken);
    const currentSession = await getSessionById(decodedRefreshToken.sessionId);

    if (currentSession && currentSession.valid) {
      const userData = await getUserById(currentSession.userId);

      const newAccessToken = await validate_login_with_cookies(res, {
        userData,
        sessionData: currentSession,
      });

      const decodedAccessToken = verifyToken(newAccessToken);
      req.user = decodedAccessToken;
      return next();
    }
  }

  req.user = null;
  return next();
};

export default authMiddleware;
