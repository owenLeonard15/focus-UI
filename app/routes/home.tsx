import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

import { auth } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));

  const actionType = formData.get("_action");
  
  console.log("FORMDATA: ", formData)

  switch (actionType) {
    case "logOut":
      // log the user out  
      // todo - reset the screen number

      await auth.logout(session, {redirectTo: "/"});
    case "incrementScreen":
      console.log(formData);
      const screenNumber = formData.get("screenNumber");
      
      session.set("screenNumber", screenNumber);
      const cookie = await sessionStorage.commitSession(session);   
      return redirect("/", {
        headers: {
          "Set-Cookie": cookie,
        },
      });   
    default:
      // Handle unknown action
      return json({ error: "Unknown action" }, { status: 400 });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const email = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const screenNumber = session.get("screenNumber") || 0;
  
  return json({ screenNumber, email });
};

export default function Home() {
  const { screenNumber, email } = useLoaderData<typeof loader>();


  
  return (
    <>
      <h1>Hello {email}</h1>
      <Form method="post">
        <input type="hidden" name="_action" value="incrementScreen" />
        <input type="hidden" name="screenNumber" value={Number(screenNumber) + 1} />
        <button type="submit">Increment Screen Number {screenNumber} </button>
      </Form>
      <Form method="post">
        <button type="submit" name="_action" value="logOut">Log Out</button>
      </Form>      
    </>
  );
}
