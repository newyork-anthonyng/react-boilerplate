import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";

function ForgotPassword() {
  const [state, send] = useMachine(machine);

  const { email } = state.context;

  const handleEmailChange = (e) => {
    send({ type: "inputEmail", value: e.target.value });
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    send({ type: "submit" });
  };

  if (state.matches("success")) {
    return <p>Check your email for password reset instructions</p>;
  }

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <label>
          Email
          <input type="email" value={email} onChange={handleEmailChange} />
        </label>
        <button type="submit">Submit</button>
      </form>
      {state.matches("ready.email.error.empty") && <p>Email is missing</p>}
      {state.matches("failure.notVerified") && (
        <div>
          <p>Verify your email first</p>
          <p>
            A verification email was sent to you. Make sure you verify your
            email first
          </p>
        </div>
      )}
      {state.matches("failure.generic") && (
        <p>Something went wrong. Try refreshing and submitting again</p>
      )}
    </div>
  );
}

export default ForgotPassword;
