import React, { useState } from 'react';
import { auth, confirmSignUp } from '~/services/auth.server';
import { Form, useNavigate, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { sessionStorage, commitSession } from '~/services/session.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("Request: ", request)
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const confirmationCode = formData.get("confirmationCode") as string;
  const res = await confirmSignUp(email, confirmationCode);

  // if successful, redirect to login page otherwise stay on the page
  if (res) {
    return redirect("/login");
  } else {
    // TODO: add error messaging to the user
    return redirect("/confirmuser");
  }
};

type LoaderError = { message: string } | null;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await auth.isAuthenticated(request, { successRedirect: "/home" });
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  const error = session.get(auth.sessionErrorKey) as LoaderError;
  return json({ error }, {
    headers:{
      'Set-Cookie': await commitSession(session) 
    }
  });
};

const ConfirmUser = () => {
  const { error } = useLoaderData<typeof loader>();


  return (
    <div className="loginForm">
      <h2>Confirm Account</h2>
      <Form method='post'>
        <div>
          <input
            className="inputText"
            type="email"
            name="email"
            placeholder="email"
            required
          />
        </div>
        <div>
          <input
            className="inputText"
            type="confirmationCode"
            name="confirmationCode"
            placeholder="confirmation code"
            required />
          {error ? <div className='error-message'>{error.message}</div> : null}
        </div>
        <button name="_action">Confirm Account</button>
      </Form>
    </div>
  );

};

export default ConfirmUser;
