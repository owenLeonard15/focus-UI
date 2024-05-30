import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { auth, handleSignUp, getUserFromCognito } from "~/services/auth.server";
import { commitSession, sessionStorage } from "~/services/session.server";


export const action = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    // check fields are not empty
    if (!email || !password || !firstName || !lastName) {
      const session = await sessionStorage.getSession(request.headers.get("Cookie"));
      session.flash(auth.sessionErrorKey, { message: "Please fill out all fields" });
      return redirect("/register", {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
      });
    }
    // validate password
    const descriptive_message = validatePassword(password);
    if (descriptive_message) {
      const session = await sessionStorage.getSession(request.headers.get("Cookie"));
      session.flash(auth.sessionErrorKey, { message: descriptive_message || "Password is invalid"});
      return redirect("/register", {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
      });
    }
    

    try {
      await handleSignUp(email, password, firstName, lastName);
      const session = await sessionStorage.getSession(request.headers.get("Cookie"));
      session.flash(auth.sessionErrorKey, { message: "Check your email for a confirmation code" });
      return redirect("/confirmuser", {
          headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
          },
      });
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        // if user is confirmed, redirect to login page
        const user = await getUserFromCognito(email);
        if (user && user.UserStatus === 'CONFIRMED') {
          const session = await sessionStorage.getSession(request.headers.get("Cookie"));
          session.flash(auth.sessionErrorKey, { message: "User already exists for " + email });
          return redirect("/login", {
              headers: {
                "Set-Cookie": await sessionStorage.commitSession(session),
              },
          });
        } else {        
          // if user exists but is not confirmed, redirect to confirm user page
          const session = await sessionStorage.getSession(request.headers.get("Cookie"));
          session.flash(auth.sessionErrorKey, { message: "Check your email for a confirmation code" });
          return redirect("/confirmuser", {
              headers: {
                "Set-Cookie": await sessionStorage.commitSession(session),
              },
          });
        }
      } else {
        const session = await sessionStorage.getSession(request.headers.get("Cookie"));
        session.flash(auth.sessionErrorKey, { message: "An error occurred: " + error.message || "Unknown error"});
        return redirect("/register", {
            headers: {
              "Set-Cookie": await sessionStorage.commitSession(session),
            },
        });
      } 
    }
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

export default function Register() {
  const navigate = useNavigate();
  const { error } = useLoaderData<typeof loader>();
  const [screenNumber, setScreenNumber] = useState(2);



  const handleReturnToLogin = () => {
    setScreenNumber(2);
    setTimeout(() => {
        navigate('/login')
    // move circle back to top before changing to login form
    }, (screenNumber * 110));
  }

  return (
   <div className="container">

          <div className={`corner-line top-left1`}></div>
          <div className={`corner-line top-left2`}></div>
          <div className={`corner-line top-right1`}></div>
          <div className={`corner-line top-right2`}></div>
          <div className={`corner-line bottom-left1`}></div>
          <div className={`corner-line bottom-left2`}></div>
          <div className={`corner-line bottom-right1`}></div>
          <div className={`corner-line bottom-right2`}></div>
          
        <Form className="loginForm fadeIn" method="post">
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
          

          {error ? <div className="error-message">{error.message}</div> : null}
          <div className="buttonColumn">
            <button className='fadeIn arrow-text' type="button" onClick={() => handleReturnToLogin()}> &#8592; Log In</button>
            <button name="_action" value="signUp"  className='fadeIn'>Register</button>
          </div>
        </Form>          
        </div> 
  );
}



function validatePassword(password: string): string | null {
  const minLength = 8;
  const numberRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters long.`;
  }
  if (!numberRegex.test(password)) {
    return 'Password must contain at least 1 number.';
  }
  if (!specialCharRegex.test(password)) {
    return 'Password must contain at least 1 special character.';
  }
  if (!uppercaseRegex.test(password)) {
    return 'Password must contain at least 1 uppercase letter.';
  }
  if (!lowercaseRegex.test(password)) {
    return 'Password must contain at least 1 lowercase letter.';
  }
  return null; // Password is valid
}
