import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import { OAuth2Profile, OAuth2Strategy } from "remix-auth-oauth2";
import { signIn, signUp, signOut } from "aws-amplify/auth"

export const auth = new Authenticator<string>(sessionStorage);

auth.use(
  new FormStrategy(async ({ form }) => {
    
    const email = form.get("email");
    const password = form.get("password");
    const actionType = form.get("_action");
    console.log("actionType: ", actionType);

    switch (actionType) {
      case "signUp":
        const firstName = form.get("firstName");
        const lastName = form.get("lastName");

        if (!firstName) throw new AuthorizationError("First Name is required");
        if (!lastName) throw new AuthorizationError("Last Name is required");
        if (!email) throw new AuthorizationError("Email is required");
        if (!password) throw new AuthorizationError("Password is required");
        console.log(firstName, lastName, email, password)
        // const {userId, isSignUpComplete, nextStep} = await handleSignUp(email, password, firstName, lastName) as { userId: string | undefined; isSignUpComplete: boolean; nextStep: any; };
        // console.log(userId, isSignUpComplete, nextStep);
        return email as string;
      case "signIn":
        if (!email) throw new AuthorizationError("Email is required");
        if (!password) throw new AuthorizationError("Password is required");
        return email as string;
      default:
        console.log("default");
        return email as string;
    }
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

// Sign Up
export async function handleSignUp(email: any, password: any, firstName: any, lastName: any) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password: password,
      options: {
        userAttributes: {
          email: email,
          first_name: firstName,
          last_name: lastName,
        },
      }
    });
    console.log(userId, isSignUpComplete, nextStep);
    return {userId, isSignUpComplete, nextStep};

  } catch (error) {
    console.log('error signing up:', error);
  }
}

// Sign In
async function handleSignIn(username: any, password: any) {
  try {
    const user = await signIn({username, password});
    console.log(user);
  } catch (error) {
    console.log('error signing in', error);
  }
}

// Sign Out
async function handleSignOut() {
  try {
    await signOut();
  } catch (error) {
    console.log('error signing out: ', error);
  }
}

// Update session with user data
export async function updateUserSession(session: any, user: any) {
  session.set("user", user);
  return session.commit();
}
