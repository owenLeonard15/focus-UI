import { useLoaderData, redirect } from "@remix-run/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useEffect } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");


    if (!code || !state) {
        return redirect("/");
    }

    const response = await fetch(`http://localhost:8080/api/callback?code=${code}&state=${state}`);
    const data = await response.json();

    // save the access token in a session or db here
    // whoop token expires in 3600 seconds or 1 hour and will need to be refreshed accordingly
    console.log("Access Token:", data.access_token);    
    console.log(data.expires_in);
    return json({ accessToken: data.access_token });
};

export default function Callback() {
    const { accessToken } = useLoaderData() as { accessToken: string };

    useEffect(() => {
        if (accessToken) {
            console.log("Access Token:", accessToken);
            // Save the access token in a session here
        }
    }, [accessToken]);

    return (
        accessToken ? null :
        <div>
            <h1>OAuth Callback</h1>
            <p>Authentication failed. Please try again.</p>
        </div>
    );
}
