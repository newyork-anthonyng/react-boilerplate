import React from "react";
import { Redirect } from "react-router-dom";
import { useMachine } from "@xstate/react";
import { Link } from "react-router-dom";
import machine from "./machine";

function Login() {
  const [state, send] = useMachine(machine);
  const { email, password } = state.context;
  const handleEmailChange = (e) => {
    send({ type: "inputEmail", value: e.target.value });
  };
  const handlePasswordChange = (e) => {
    send({ type: "inputPassword", value: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send({ type: "submit" });
  };

  if (state.matches("success")) {
    return <Redirect to="/protected" />;
  }

  if (state.matches("ready.auth.notVerified")) {
    return (
      <div>
        <p>Email is not verified</p>
        Didn&apos;t receive a verification email?{" "}
        <Link to="/resend-verification">Click here to send again.</Link>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={handleEmailChange} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>

        <button type="submit">Login</button>
      </form>
      {state.matches("ready.email.empty") && <p>Email is empty</p>}
      {state.matches("ready.password.empty") && <p>Password is empty</p>}
      {state.matches("ready.auth.unauthorized") && (
        <p>Email/password combination is incorrect</p>
      )}
    </div>
  );
}

export default Login;
