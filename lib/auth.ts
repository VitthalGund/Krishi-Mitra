import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const ENCODED_SECRET = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload extends JWTPayload {
  userId: string;
  mobileNumber: string;
}

export const signAccessToken = async (
  payload: TokenPayload
): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ENCODED_SECRET);
};

export const signRefreshToken = async (
  payload: TokenPayload
): Promise<string> => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(ENCODED_SECRET);
};

export const verifyToken = async (token: string): Promise<TokenPayload> => {
  try {
    const { payload } = await jwtVerify(token, ENCODED_SECRET);
    return payload as TokenPayload;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid Token");
  }
};
