import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { auth, sessionStorage } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  let user = await auth.authenticate("form", request, {
    successRedirect: "/home",
    failureRedirect: "/",
  });

  console.log(user)

  // if (user) {
  //   return redirect("/home");
  // } else {
  //   return redirect("/");
  // }

  // TODO: add animation on success here and redirect to home afterwards
  
};

type LoaderError = { message: string } | null;
export const loader = async ({ request }: LoaderFunctionArgs) => {
  await auth.isAuthenticated(request, { successRedirect: "/home" });
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  const error = session.get(auth.sessionErrorKey) as LoaderError;
  return json({ error });
};

export default function Index() {
  const { error } = useLoaderData<typeof loader>();
  const[loading, setLoading] = useState(true);
  const [screenNumber, setScreenNumber] = useState(0);

  const handleCircleClick = () => {
    setScreenNumber(1);
    // wait 2 second before setting screen to 2
    setTimeout(() => {
      setScreenNumber(2);
      setLoading(false);
    }, 2000);
  };


  return (
    loading
      ? <div className="container">
          <div 
            className={`circle 
            ${screenNumber === 1 
              ? 'first-screen' 
              : screenNumber === 2
              ? 'second-screen'
              : ''
            }`
            }
            onClick={handleCircleClick}>
          </div>
        </div>
      : <div className="container">
          <Form method="post">
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
            <div className='fadeIn'>
              <input
                type="email"
                name="email"
                id="email"
                onFocus={() => setScreenNumber(2)}
                placeholder="email"
                style={{paddingLeft: '15px'}}
              />
            </div>

            <div className='fadeIn'>
              <input
                type="password"
                name="password"
                id="password"
                onFocus={() => setScreenNumber(3)}
                placeholder="password"
                style={{paddingLeft: '15px'}}
              />
            </div>
            {error ? <div>{error.message}</div> : null}
            <button className='fadeIn'>Log In</button>
          </Form>
        </div> 
  );
}
