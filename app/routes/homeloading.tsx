import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { IntegrationInstructions } from "@mui/icons-material";


import { auth } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import DateTime from "~/components/DateTime";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const actionType = formData.get("_action");
  
  switch (actionType) {
    case "logOut":
      // reset the screen number back to 0 when logging out
      session.set("screenNumber", "0"); // Explicitly unset or reset the screenNumber
      await sessionStorage.commitSession(session)
      await auth.logout(session, {redirectTo: "/"});
      
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
  let screenNumber = session.get("screenNumber") || 0;
  
  return json({ screenNumber, email });
};


export default function Home() {
  const { screenNumber, email } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [count, setCount] = useState(screenNumber || 0);
  const navigate = useNavigate();

  useEffect(() => {
    
    if (count === 0) {
      setTimeout(() => {
        setCount(1);
        fetcher.submit(
          { _action: "incrementScreen", screenNumber: 1 },
          { method: "POST" }
        )
        navigate("/home")
      }, 2350);
    } else {
      navigate("/home")
    }
      }, []);
  
  
  return (
      <div className="split-screen">
        <div className={`corner-line top-left1 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line top-left2 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line top-right1 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line top-right2 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line bottom-left1 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line bottom-left2 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line bottom-right1 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        <div className={`corner-line bottom-right2 ${screenNumber===0 ? 'hidden-flicker' : 'hidden'}`}></div>
        
        <div className={`left ${count === 0 ? 'loading' : 'active'}`}>

            <nav>
              <Form className="links">
                <h2>FITNESS</h2>
                <h2>NUTRITION</h2>
                <h2>SLEEP</h2>
              </Form>
            </nav>

        </div>
        <div className="right">
          {/* <IntegrationInstructions style={{color: 'white', width: '20px', zIndex:10, backgroundColor: 'pink'}} sx={{ color: pink[500] , width: '20px'}}  /> */}
          <DateTime />
         
          <Form className="logOut" method="post">
            <input type="hidden" name="_action" value="logOut" />
            <button className="logOutButton">Log Out</button>
          </Form>
          <Form>
          </Form>
          <div className="content">
            <div className={`circle fourth-screen ${count === 0 ? 'moveandgrow' : 'grown'}`}></div>
          </div>
        </div> 
      </div>    
  );
}

