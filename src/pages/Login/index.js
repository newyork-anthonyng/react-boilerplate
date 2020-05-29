import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";
import { Redirect } from "react-router-dom";

function LoginPage() {
  const [state, send] = useMachine(machine);
  const { email, password } = state;

  const handleEmailChange = (e) =>
    send({ type: "INPUT_EMAIL", value: e.target.value });
  const handlePasswordChange = (e) =>
    send({ type: "INPUT_PASSWORD", value: e.target.value });
  const handleFormSubmit = (e) => {
    e.preventDefault();
    send({ type: "SUBMIT" });
  };

  if (state.matches("success")) {
    return <Redirect to="/protected" />;
  }

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <label>
          Email
          <input type="text" onChange={handleEmailChange} value={email}></input>
        </label>

        <label>
          Password
          <input
            type="password"
            onChange={handlePasswordChange}
            value={password}
          ></input>
        </label>

        <button type="submit" disabled={!state.matches("ready")}>
          Login
        </button>
      </form>
      <div>
        {state.matches("ready.email.error.empty") && <p>Email is missing</p>}
        {state.matches("ready.password.error.empty") && (
          <p>Password is missing</p>
        )}
        {state.matches("ready.auth.error.unauthorized") && (
          <p>Log in failed. Try again.</p>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
