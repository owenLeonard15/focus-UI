import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { auth } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";


export const action = async ({ request }: ActionFunctionArgs) => {
  await auth.authenticate("form", request, {
    failureRedirect: "/",
    successRedirect: "/home",
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
  const[loading, setLoading] = useState(true);
  const [screenNumber, setScreenNumber] = useState(0);
  const navigate = useNavigate();

  const handleCircleClick = () => {
    setScreenNumber(1);
    // wait 2 second before setting screen to 2
    setTimeout(() => {
      setScreenNumber(2);
      navigate('/login')
    }, 800);
  };


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

          <div className={`corner-line top-left1 flicker`}></div>
          <div className={`corner-line top-left2 flicker`}></div>
          <div className={`corner-line top-right1 flicker`}></div>
          <div className={`corner-line top-right2 flicker`}></div>
          <div className={`corner-line bottom-left1 flicker`}></div>
          <div className={`corner-line bottom-left2 flicker`}></div>
          <div className={`corner-line bottom-right1 flicker`}></div>
          <div className={`corner-line bottom-right2 flicker`}></div>
          
        </div> 
  );
}
