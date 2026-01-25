export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local authentication - no external OAuth
export const getLoginUrl = () => {
  return "/login";
};
