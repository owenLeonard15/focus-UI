import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";

import { auth } from "~/services/auth.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await auth.logout(request, { redirectTo: "/" });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const email = await auth.isAuthenticated(request, {
    failureRedirect: "/",
  });

  return json({ email });
};

export default function Home() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Hello {email}</h1>

      <Form method="post">
        <button>Log Out</button>
      </Form>
    </>
  );
}
