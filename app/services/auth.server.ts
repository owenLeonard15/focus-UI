import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import { OAuth2Profile, OAuth2Strategy } from "remix-auth-oauth2";
import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import config from "../config.json";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

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
        const res = await handleSignUp(email, password, firstName, lastName);
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
  const params = {
    ClientId: config.clientId,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "first_name",
        Value: firstName,
      },
      {
        Name: "last_name",
        Value: lastName,
      }
    ],
  };
  try {
    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);
    console.log("Sign up success: ", response);
    return response;
  } catch (error) {
    console.error("Error signing up: ", error);
    throw error;
  }
}

// Sign In
async function handleSignIn(username: any, password: any) {
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: config.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };
  try {
    const command = new InitiateAuthCommand(params);
    const { AuthenticationResult } = await cognitoClient.send(command);
    if (AuthenticationResult) {
      // sessionStorage.setItem("idToken", AuthenticationResult.IdToken || '');
      // sessionStorage.setItem("accessToken", AuthenticationResult.AccessToken || '');
      // sessionStorage.setItem("refreshToken", AuthenticationResult.RefreshToken || '');
      return AuthenticationResult;
    }
  } catch (error) {
    console.error("Error signing in: ", error);
    throw error;
  }
}

// Sign Out
async function handleSignOut() {
  // sessionStorage.removeItem("idToken");
  // sessionStorage.removeItem("accessToken");
  // sessionStorage.removeItem("refreshToken");
  return;
}

// Update session with user data
export async function updateUserSession(session: any, user: any) {
  session.set("user", user);
  return session.commit();
}

export const confirmSignUp = async (username: string, code: string) => {
  const params = {
    ClientId: config.clientId,
    Username: username,
    ConfirmationCode: code,
  };
  try {
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error) {
    console.error("Error confirming sign up: ", error);
    throw error;
  }
};
