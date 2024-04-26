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

const dayOfWeek = (day: number) => {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "Invalid day";
  }
}

const getMonth = (month: number) => {
  switch (month) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
    default:
      return "Invalid month";
  }
}

export default function Home() {
  const { screenNumber, email } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [count, setCount] = useState(screenNumber || 0);
  
  const currentDate = new Date();
  const currentTime = currentDate.toLocaleTimeString();


  const handleIncrement = async (e: any) => {
    setCount(Number(count) + 1);
    fetcher.submit(e.target, {method: "post"});
  }

  useEffect(() => {
    // submit json data to increment screen number
      // Submit key/value JSON as a FormData instance
      // fetcher.submit(
      //   { serialized: "values" },
      //   { method: "POST" }
      // );
    if (count === 0) {
      setTimeout(() => {
        setCount(1);
        fetcher.submit(
          { _action: "incrementScreen", screenNumber: 1 },
          { method: "POST" }
        )
      }, 2350);
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
              
              {/* <h1 style={{color: 'black'}}>Hello {email}</h1>
              <Form method="post" onSubmit={handleIncrement}>
                <input type="hidden" name="_action" value="incrementScreen" />
                <input type="hidden" name="screenNumber" value={Number(count) + 1} />
                <button type="submit">Increment Screen Number {count} </button>
              </Form> */}
            </nav>
        </div>
        <div className="right">
          {/* display the date in format of "Weekday Month DD, YYYY*/}
          <div className="datetime">
            <h4 className="date">{dayOfWeek(currentDate.getDay())} {getMonth(currentDate.getMonth())} {currentDate.getDate()}, {currentDate.getFullYear()}</h4>
            {/* drop seconds from the time and add AM or PM */}
            <h3 className="time"> {currentTime.slice(0, currentTime.length - 6)} {currentTime.slice(-2)}</h3>
          </div>
          
          <Form className="logOut" method="post">
            <input type="hidden" name="_action" value="logOut" />
            <button className="logOutButton">Log Out</button>
          </Form>
          <div className="content">
            <div className={`circle fourth-screen ${count === 0 ? 'moveandgrow' : 'grown'}`}></div>

          </div>
        </div> 
      </div>    
  );
}

