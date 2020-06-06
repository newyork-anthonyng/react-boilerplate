import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";
import { Link } from "react-router-dom";

function ResendVerification() {
  const [state, send] = useMachine(machine);

  const { email } = state.context;
  const handleEmailChange = (e) => {
    send({ type: "inputEmail", value: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send({ type: "submit" });
  };

  if (state.matches("failure.alreadyVerified")) {
    return (
      <div>
        User is already verified. <Link to="/login">Log in</Link>
      </div>
    );
  }

  if (state.matches("failure.missingUser")) {
    return <div>User not found.</div>;
  }

  if (state.matches("failure.generic")) {
    return <div>Something went wrong. Refresh the page and try again.</div>;
  }

  if (state.matches("submitting")) {
    return <p>Submitting...</p>;
  }

  if (state.matches("success")) {
    return <div>Verification email resent to {email}</div>;
  }

  if (state.matches("ready")) {
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Email{" "}
            <input type="email" value={email} onChange={handleEmailChange} />
          </label>
          <button type="submit">Submit</button>
        </form>
        {state.matches("ready.email.empty") && <p>Email is missing</p>}
      </div>
    );
  }
}

export default ResendVerification;
