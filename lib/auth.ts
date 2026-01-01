import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback_secret_do_not_use_in_production";
const ENCODED_SECRET = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  mobileNumber: string;
}

export const signAccessToken = async (payload: TokenPayload) => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ENCODED_SECRET);
};

export const signRefreshToken = async (payload: TokenPayload) => {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENCODED_SECRET);
};

export const verifyAccessToken = async (
  token: string
): Promise<TokenPayload> => {
  try {
    const { payload } = await jwtVerify(token, ENCODED_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    throw new Error("Invalid Access Token");
  }
};

export const verifyRefreshToken = async (
  token: string
): Promise<TokenPayload> => {
  try {
    const { payload } = await jwtVerify(token, ENCODED_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    throw new Error("Invalid Refresh Token");
  }
};
