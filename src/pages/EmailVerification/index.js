import React from "react";
import { Link, useParams } from "react-router-dom";
import { useMachine } from "@xstate/react";
import machine from "./machine";

function EmailVerification() {
  const { token } = useParams();
  const [state] = useMachine(machine(token));

  if (state.matches("loading")) {
    return <p>Loading...</p>;
  }

  if (state.matches("success")) {
    return (
      <div>
        Email successfully verified. <Link to="/login">Log in</Link>
      </div>
    );
  }

  return (
    <div>
      {state.matches("failure.expired") && (
        <p>Email verification expired. Try again.</p>
      )}
      {state.matches("failure.alreadyVerified") && (
        <p>
          Email already verified. <Link to="/login">Log in.</Link>
        </p>
      )}
      {state.matches("failure.userNotFound") && (
        <p>User not found. Try signing up again.</p>
      )}
    </div>
  );
}

export default EmailVerification;
