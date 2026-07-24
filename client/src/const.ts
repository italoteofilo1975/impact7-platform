export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Local authentication - no external OAuth
export const getLoginUrl = (opts?: { redirect?: string; reason?: string }) => {
  const params = new URLSearchParams();

  const redirect = opts?.redirect;
  if (redirect) {
    params.set("redirect", redirect);
  }

  if (opts?.reason) {
    params.set("reason", opts.reason);
  }

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
};
