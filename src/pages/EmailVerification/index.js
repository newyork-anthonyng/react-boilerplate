import React from "react";
import { Link, useParams } from "react-router-dom";
import machine from "./machine";
import { useMachine } from "@xstate/react";

function EmailVerification() {
  const { token } = useParams();
  const [state] = useMachine(machine(token));

  if (state.matches("loading")) {
    return "Loading...";
  }

  if (state.matches("error.alreadyVerified")) {
    return (
      <div>
        <p>Email already verified</p>
        <Link to="/login">Log in</Link>
      </div>
    );
  }

  if (state.matches("error.userMissing")) {
    return (
      <div>
        <p>User not found</p>
      </div>
    );
  }

  if (state.matches("error.tokenExpired")) {
    return (
      <div>
        <p>Email verification expired</p>
        <Link to="/resend-verification">Send another verification email</Link>
      </div>
    );
  }

  if (state.matches("error.generic")) {
    return <div>Something weird happened. Try refreshing the page</div>;
  }

  if (state.matches("success")) {
    return (
      <div>
        Email successfully verified
        <Link to="/login">Log in</Link>
      </div>
    );
  }
}

export default EmailVerification;
