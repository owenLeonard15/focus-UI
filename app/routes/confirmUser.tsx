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
  // validate fields
  if (!email || !confirmationCode) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.flash(auth.sessionErrorKey, { message: "Please fill out all fields" });
    return redirect("/confirmuser", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    await confirmSignUp(email, confirmationCode);
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.flash(auth.sessionErrorKey, { message: "User confirmed. Please log in." });
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });

  } catch (error: any) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    session.flash(auth.sessionErrorKey, { message: error.message });
    return redirect("/confirmuser", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
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
  const [screenNumber, setScreenNumber] = useState(2);


  return ( 
    <div className="container">
      <Form className="loginForm fadeIn" method="post">
      <div 
        className={`circle
          ${screenNumber === 2 
            ? 'second-screen' 
            : screenNumber === 3
            ? 'third-screen'
            : ''
          }`
        }
      >
      </div>
      <div>
        <input
          type="email"
          name="email"
          id="email"
          onFocus={() => setScreenNumber(2)}
          placeholder="email"
        />
      </div>
      <div>
         <input
            type="confirmationCode"
            name="confirmationCode"
            id="confirmationCode"
            placeholder="confirmation code"
            onFocus={() => setScreenNumber(3)}
          />
      </div>
      {error ? <div className='error-message'>{error.message}</div> : null}
      <div className="buttonColumn">
        {/* <button className='fadeIn arrow-text' type="button" onClick={() => handleReturnToLogin()}> &#8592; Log In</button> */}
        <button name="_action">Confirm Account</button>
      </div>
      </Form>          
    </div> 
  );

};

export default ConfirmUser;
