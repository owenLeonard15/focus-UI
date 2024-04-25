import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { act } from "react-dom/test-utils";

import { auth } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const actionType = formData.get("_action");
  
  switch (actionType) {
    case "logOut":
     
      session.set("screenNumber", "0"); // Explicitly unset or reset the screenNumber
      const cookieReset = await sessionStorage.commitSession(session)
      // reset the screen number back to 0 when logging out
      await auth.logout(session, {redirectTo: "/"});
      // return redirect("/", {
      //   headers: {
      //     "Set-Cookie": cookieReset,
      //   },
      // })
    case "incrementScreen":
      const screenNumber = formData.get("screenNumber");
      console.log(screenNumber)
      session.set("screenNumber", screenNumber);
      const cookieIncrement = await sessionStorage.commitSession(session);   
      return redirect("/", {
        headers: {
          "Set-Cookie": cookieIncrement,
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
  console.log("Loaded data: ", session.data)
  // log session id
  let screenNumber = session.get("screenNumber") || 0;
  // if (screenNumber === 0) {
  //   console.log("screenNumber is 0")
  //     // wait 2 second before setting screen to 1
  //     setTimeout(async () => {
  //       session.set("screenNumber", 1);
  //       screenNumber = 1;
  //       const cookieIncrement = await sessionStorage.commitSession(session); 
  //       redirect("/", {
  //         headers: {
  //           "Set-Cookie": cookieIncrement,
  //         },
  //       });   
  //       return json({ screenNumber, email }, {  headers: {  "Set-Cookie": cookieIncrement, }, });
  //     }, 800);
  // }
  
  return json({ screenNumber, email });
};

export default function Home() {
  const { screenNumber, email } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [count, setCount] = useState(screenNumber || 0);
  
  const handleIncrement = async (e: any) => {
    setCount(Number(count) + 1);
    fetcher.submit(e.target, {method: "post"});
  }

  
  return (
      <div className="split-screen">
        <div className={`left ${count === 0 ? 'loading' : 'active'}`}>
            <nav>
              <h1 style={{color: 'black'}}>Hello {email}</h1>
              <Form method="post" onSubmit={handleIncrement}>
                <input type="hidden" name="_action" value="incrementScreen" />
                <input type="hidden" name="screenNumber" value={Number(count) + 1} />
                <button type="submit">Increment Screen Number {count} </button>
              </Form>
            </nav>
        </div>
        <div className="right">
          <Form className="logOut" method="post">
            <input type="hidden" name="_action" value="logOut" />
            <button>Log Out</button>
          </Form>
          {/* <div className="content">
            <h1>Welcome {email}</h1>
            <h2>Screen Number: {count}</h2>
            <div className={`circle fourth-screen`}></div>

          </div> */}
        </div> 
      </div>    
  );
}

