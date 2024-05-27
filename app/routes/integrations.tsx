import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, redirect, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
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
    case "integration.Whoop":
      // Handle integration.Whoop action
      console.log("Integration Whoop");
      // redirect to the OAuth page for Whoop integration
      return redirect("http://localhost:8080/api/auth/whoop?userId=${userId}");

        
      default:
        // Handle unknown action
        return json({ error: "Unknown action" }, { status: 400 });
    }
  };


export default function Integrations() {

    const possibleIntegrationsDB = [
        { integration: "Whoop" },
        { integration: "Oura" },
        { integration: "Garmin" },
        { integration: "Strava" },
        { integration: "Fitbit" },
        { integration: "Apple Health" },
        { integration: "Google Fit" },
        { integration: "Samsung Health" },
        { integration: "Polar" },
        { integration: "Withings" },
        { integration: "Integration 11" },
        { integration: "Integration 12" },
        { integration: "Integration 13" },
        { integration: "Integration 14" },
        { integration: "Integration 15" },
        { integration: "Integration 16" },
        { integration: "Integration 17" },
        { integration: "Integration 18" },
        { integration: "Integration 19" },
        { integration: "Integration 20" },
    ];

    return (
        <>
            <IntegrationsTable />
            <Form className="logOutIntegrations" method="post">
                <input type="hidden" name="_action" value="logOut" />
                <button className="logOutButton">Log Out</button>
            </Form>
        </>
    );
}


