import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import { OAuth2Profile, OAuth2Strategy } from "remix-auth-oauth2";

export const auth = new Authenticator<string>(sessionStorage);

auth.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    // replace the code below with your own authentication logic
    if (!password) throw new AuthorizationError("Password is required");
    if (password !== "test") {
      throw new AuthorizationError("Invalid credentials");
    }
    if (!email) throw new AuthorizationError("Email is required");

    return email as string;
  }),
).use(
  new OAuth2Strategy(
    {
      authorizationURL: "https://api.prod.whoop.com/oauth/oauth2/auth",
      tokenURL: "https://api.prod.whoop.com/oauth/oauth2/token",
      clientID: process.env.CLIENT_ID || "",
      clientSecret: process.env.CLIENT_SECRET || "",
      callbackURL: "http://localhost:5173/integrations",
      useBasicAuthenticationHeader: false // defaults to false
    },
    async ({
      accessToken,
      refreshToken,
      extraParams,
      profile,
      context,
      request,
    }) => {
      // use the params above to get the user and return it
      return await getUser(
        accessToken,
        refreshToken,
        extraParams,
        profile,
        context,
        request
      );
    }
  ),
  // this is optional, but if you setup more than one OAuth2 instance you will
  // need to set a custom name to each one
  "whoop-oauth2"
);


function getUser(accessToken: string, refreshToken: string | undefined, extraParams: Record<string, never>, profile: OAuth2Profile, context: import("@remix-run/node").AppLoadContext | undefined, request: Request): any {
  throw new Error("Function not implemented.");
}

