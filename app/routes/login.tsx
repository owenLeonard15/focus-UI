import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useNavigate, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { auth } from "~/services/auth.server";
import { commitSession, sessionStorage } from "~/services/session.server";



export const action = async ({ request }: ActionFunctionArgs) => {
    await auth.authenticate("form", request, {
        failureRedirect: "/login",
        successRedirect: "/homeloading",
      });
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

export default function Index() {
  const { error } = useLoaderData<typeof loader>();
  const[loading, setLoading] = useState(false);
  const [screenNumber, setScreenNumber] = useState(2);
  const navigate = useNavigate();
  
 
  const handleRegisterAnimation = () => {
    setScreenNumber(2);
    setTimeout(() => {
      navigate('/register')
    }, (screenNumber * 110));
  }

  return (
    loading
      ? <div className="container">
          <div className={`corner-line top-left1`}></div>
          <div className={`corner-line top-left2`}></div>
          <div className={`corner-line top-left3 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-left4 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-right1`}></div>
          <div className={`corner-line top-right2`}></div>
          <div className={`corner-line top-right3 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-right4 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-left1`}></div>
          <div className={`corner-line bottom-left2`}></div>
          <div className={`corner-line bottom-left3 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-left4 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-right1`}></div>
          <div className={`corner-line bottom-right2`}></div>
          <div className={`corner-line bottom-right3 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-right4 ${screenNumber===1 ? 'flicker' : screenNumber===2 ? 'flicker' : ''}`}></div>

          <div 
            className={`circle 
            ${screenNumber === 1 
              ? 'first-screen' 
              : screenNumber === 2
              ? 'second-screen'
              : ''
            }`
            }
          >
          </div>
        </div>
      : <div className="container">

          <div className={`corner-line top-left1 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-left2 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-right1 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-right2 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-left1 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-left2 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-right1 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-right2 ${(screenNumber===2 || screenNumber===3)  ? 'flicker' : ''}`}></div>
          
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
                style={{paddingLeft: '15px'}}
              />
            </div>

            <div>
              <input
                type="password"
                name="password"
                id="password"
                onFocus={() => setScreenNumber(3)}
                placeholder="password"
                style={{paddingLeft: '15px'}}
              />
            </div>
            {error ? <div className="error-message">{error.message}</div> : null}
            <div className="buttonColumn">
              <button name="_action" value="signIn" className='fadeIn'>Log In</button>
              <button className='fadeIn arrow-text' type="button" onClick={() => handleRegisterAnimation()}>Register &#8594;</button>
            </div>
          </Form>
        </div> 
  );
}
