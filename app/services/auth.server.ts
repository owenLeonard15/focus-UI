import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "./session.server";
import { OAuth2Profile, OAuth2Strategy } from "remix-auth-oauth2";
import { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand, 
  SignUpCommand, 
  ConfirmSignUpCommand, 
  AuthFlowType, 
  ResendConfirmationCodeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import config from "../config.json";
import crypto from 'crypto';
import { User } from "~/models/User";

export const cognitoClient = new CognitoIdentityProviderClient({
  region: config.region,
});

export const auth = new Authenticator<User>(sessionStorage);

auth.use(
  new FormStrategy(async ({ form }) => {
    
    const email = form.get("email");
    const password = form.get("password");

    if (!email) throw new AuthorizationError("Email is required");
    if (!password) throw new AuthorizationError("Password is required");
    let signInRes = await handleSignIn(email, password);
    // TODO: handle case where the user is not confirmed
    if (signInRes?.IdToken) {
      return new User(
        signInRes?.IdToken as string,
        email as string,
        password as string,
        true,
        new Date(),
        new Date()
      );
    }
    else {
      throw new AuthorizationError("Invalid credentials");
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
  const username = getUsernameFromEmail(email);
  const secretHash = generateSecretHash(username, config.clientId, config.clientSecret)
  const params = {
    ClientId: config.clientId,
    Username: username,
    Password: password,
    SecretHash: secretHash,
    UserAttributes: [
      {
        Name: "email",
        Value: email,
      },
      {
        Name: "given_name",
        Value: firstName,
      },
      {
        Name: "family_name",
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
async function handleSignIn(email: any, password: any) {
  const username = getUsernameFromEmail(email);
  const secretHash = generateSecretHash(username, config.clientId, config.clientSecret);
  const params = {
    AuthFlow: "USER_PASSWORD_AUTH" as AuthFlowType,
    ClientId: config.clientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
      SECRET_HASH: secretHash,
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


// Confirm Sign Up
export const confirmSignUp = async (email: string, code: string) => {
  const username = getUsernameFromEmail(email);
  const secretHash = generateSecretHash(username, config.clientId, config.clientSecret);
  const params = {
    ClientId: config.clientId,
    Username: username,
    ConfirmationCode: code,
    SecretHash: secretHash
  };

  try {
    console.log("Confirming sign up: ", params);
    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);
    console.log("User confirmed successfully");
    return true;
  } catch (error: any) {
    if (error.name === 'ExpiredCodeException') {
      // TODO: add error messaging to the user here
      console.log("Code expired, resending code");
      // resend code
      await resendConfirmationCode(email);
      return false;
    } else {
      console.error("Error confirming sign up: ", error);
      throw error;
    }
  }
};


function generateSecretHash(username: string, clientId: string, clientSecret: string) {
  const message = username + clientId;
  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(message);
  return hmac.digest('base64');
}


const resendConfirmationCode = async (email: string) => {
  const username = getUsernameFromEmail(email);
  const secretHash = generateSecretHash(username, config.clientId, config.clientSecret);
  const params = {
    ClientId: config.clientId,
    Username: email,
    SecretHash: secretHash
  };

  try {
    const command = new ResendConfirmationCodeCommand(params);
    await cognitoClient.send(command);
    return true;
  } catch (error: any) {
    console.error("Error resending confirmation code: ", error);
    throw error;
  }
  
}

// given an email, return a unique username
function getUsernameFromEmail (email: string) {
  const hash = crypto.createHash('sha256');
  hash.update(email);
  const res = hash.digest('hex');
  return res;
}
