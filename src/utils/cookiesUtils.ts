import Cookies from "js-cookie";

export enum COOKIE_NAMES {
  RESET_USER_EMAIL = "resetUserEmail",
  TOKEN_USER_EMAIL = "tokenUserEmail",
  BOUNTIP_REGISTERED_USERS = "bountipRegisteredUsers",
  REG_USER_EMAIL = "regUserEmail",
  BOUNTIP_LOGIN_USER = "bountipLoginUser",
  BOUNTIP_LOGIN_USER_TOKENS = "bountipLoginUserTokens",
  BOUNTIP_LOCATION_ONBOARD = "bountipOnboardLocation"
}

type ExtendedCookieOptions = Cookies.CookieAttributes & {
  expiresInMinutes?: number;
};

/**
 * Stores a value (string or object) in a cookie.
 */
export const setCookie = (
  key: string,
  value: string | Record<string, unknown>,
  options: ExtendedCookieOptions = {}
): void => {
  const { expiresInMinutes, ...rest } = options;
  const finalOptions = { ...rest };

  if (expiresInMinutes !== undefined) {
    finalOptions.expires = expiresInMinutes / (24 * 60);
  }

  const cookieValue = typeof value === "string" ? value : JSON.stringify(value);
  Cookies.set(key, cookieValue, finalOptions);
};

/**
 * Retrieves a cookie and parses it if it's JSON.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCookie = <T = any>(key: string): T | undefined => {
  const value = Cookies.get(key);
  if (!value) return undefined;

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T; // fallback to plain string
  }
};

export const removeCookie = (key: string): void => {
  Cookies.remove(key);
};
