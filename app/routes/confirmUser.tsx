import React, { useState } from 'react';
import { auth, confirmSignUp } from '~/services/auth.server';
import { Form, useNavigate, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

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

const ConfirmUser = () => {

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
        </div>
        <button name="_action">Confirm Account</button>
      </Form>
    </div>
  );

};

export default ConfirmUser;
