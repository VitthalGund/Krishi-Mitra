import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_do_not_use_in_production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  "fallback_refresh_secret_do_not_use_in_production";

export interface TokenPayload {
  userId: string;
  mobileNumber: string;
}

export const signAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
};

export const signRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid Access Token");
  }
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error("Invalid Refresh Token");
  }
};
