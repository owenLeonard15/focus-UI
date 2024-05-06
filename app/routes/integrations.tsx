import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { SetStateAction, useEffect, useState } from "react";
import { auth } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import IntegrationsTable from "~/components/IntegrationsTable";



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
        
      default:
        // Handle unknown action
        return json({ error: "Unknown action" }, { status: 400 });
    }
  };

const possibleIntegrationsDB = [
    "Whoop",
    "Oura",
    "Garmin",
    "Strava"
]

export default function HomeLoaded() {
    const [screenNumber, setScreenNumber] = useState(0);

        return (
            <div className='integrationsScreen'>
                <IntegrationsTable setScreenNumber={function (value: SetStateAction<number>): void {
                    throw new Error("Function not implemented.");
                } } />
                <Form className="logOut" method="post">
                  <input type="hidden" name="_action" value="logOut" />
                  <button className="logOutButton">Log Out</button>
                </Form>
            </div>
    );
}


