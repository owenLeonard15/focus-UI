import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, json, redirect, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import TypingAnimation from '~/components/TypingAnimation';
import arrow from "/arrow.png";
import { auth } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import DateTime from '~/components/DateTime';


const lines = [
    "Hello, welcome to your personal dashboard. I am here to help you with your daily activities. I can help you with fitness, nutrition, and sleep.",
];


// function to convert lines to an array of strings each of max length
function splitLines(lines: string[]) {
  let splitLines: string[] = [];
  lines.forEach(line => {
    let words = line.split(" ");
    let currentLine = "";
    words.forEach(word => {
      if (currentLine.length + word.length <= 50) {
        currentLine += word + " ";
      } else {
        splitLines.push(currentLine);
        currentLine = word + " ";
      }
    });
    splitLines.push(currentLine);
  });
  return splitLines;
}

  export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const actionType = formData.get("_action");
    
    switch (actionType) {
      case "logOut":
        await auth.logout(session, {redirectTo: "/"});
      default:
        // Handle unknown action
        return json({ error: "Unknown action" }, { status: 400 });
    }
  };

export default function HomeLoaded() {
    const [activeLine, setActiveLine] = useState(0);

        return (
            <div className="split-screen">
              <div className={`left active`}>
                  <nav>
                    <Form className="links">
                      <h2>FITNESS</h2>
                      <h2>NUTRITION</h2>
                      <h2>SLEEP</h2>
                    </Form>
                    
                  </nav>
                  <div className="content-container">
                    <div className="text-container">
                        <TypingAnimation lines={splitLines(lines)} activeLine={activeLine} setActiveLine={setActiveLine} />
                    </div>
                    <div className="arrow-container">
                        {activeLine >= splitLines(lines).length ? 
                        <>
                          <img
                            src={arrow}
                            alt="arrow"
                            className="arrow fadeIn"
                          />  
                          <h3 className="fadeIn">BEGIN</h3>
                        </>
                        : ''
                        }
                    </div>
                  </div>
      
              </div>
              <div className="right">
                {/* display the date in format of "Weekday Month DD, YYYY*/}
                <DateTime />
               
                <Form className="logOut" method="post">
                  <input type="hidden" name="_action" value="logOut" />
                  <button className="logOutButton">Log Out</button>
                </Form>
                <Link to="/integrations">
                  <button className="integrationsButton">Integrations</button>
                </Link>
                <div className="content">
                  <div className={`circle fourth-screen grown`}></div>
                </div>
              </div> 
            </div>
    );
}


