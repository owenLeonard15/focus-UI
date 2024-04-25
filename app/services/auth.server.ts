import { createCookieSessionStorage } from "@remix-run/node";
import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";

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
);
