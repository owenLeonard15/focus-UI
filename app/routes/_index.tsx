import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { auth, handleSignUp } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";


export const action = async ({ request }: ActionFunctionArgs) => {
  let user = await auth.authenticate("form", request, {
    failureRedirect: "/",
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
  return json({ error });
};

export default function Index() {
  const { error } = useLoaderData<typeof loader>();
  const[loading, setLoading] = useState(true);
  const [register, setRegister] = useState(false);
  const [screenNumber, setScreenNumber] = useState(0);

  const handleCircleClick = () => {
    setScreenNumber(1);
    // wait 2 second before setting screen to 2
    setTimeout(() => {
      setScreenNumber(2);
      setLoading(false);
    }, 800);
  };

  const handleReturnToLogin = () => {
    setScreenNumber(2);
    setTimeout(() => {
      setRegister(false);
    // move circle back to top before changing to login form
    }, (screenNumber * 110));
  }

  const handleRegisterAnimation = () => {
    setScreenNumber(2);
    setTimeout(() => {
      setRegister(true);
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
            onClick={handleCircleClick}>
          </div>
        </div>
      : <div className="container">

          <div className={`corner-line top-left1 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-left2 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-right1 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line top-right2 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-left1 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-left2 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-right1 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          <div className={`corner-line bottom-right2 ${(screenNumber===2 || screenNumber===3) && !register ? 'flicker' : ''}`}></div>
          
          { !register ?
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
            {error ? <div>{error.message}</div> : null}
            <div className="buttonColumn">
              <button name="_action" value="signIn" className='fadeIn'>Log In</button>
              <button className='fadeIn arrow-text' type="button" onClick={() => handleRegisterAnimation()}>Register &#8594;</button>
            </div>
          </Form>
          : <Form className="loginForm fadeIn" method="post">
          <div 
            className={`circle
              ${screenNumber === 2 
                ? 'second-screen' 
                : screenNumber === 3
                ? 'third-screen'
                : screenNumber === 4
                ? 'username-position'
                : screenNumber === 5
                ? 'password-position'
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
          <div>
            <input
              type="firstName"
              name="firstName"
              id="firstName"
              onFocus={() => setScreenNumber(4)}
              placeholder="first name"
              style={{paddingLeft: '15px'}}
            />
          </div>
          <div>
            <input
              type="lastName"
              name="lastName"
              id="lastName"
              onFocus={() => setScreenNumber(5)}
              placeholder="last name"
              style={{paddingLeft: '15px'}}
            />
          </div>
          

          {error ? <div>{error.message}</div> : null}
          <div className="buttonColumn">
            <button className='fadeIn arrow-text' type="button" onClick={() => handleReturnToLogin()}> &#8592; Log In</button>
            <button name="_action" value="signUp"  className='fadeIn'>Register</button>
          </div>
        </Form>
        }
          
        </div> 
  );
}
