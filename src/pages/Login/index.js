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
  const handleResendClick = () => {
    send({ type: "RESEND_VERIFICATION" });
  };

  if (state.matches("notVerified")) {
    return (
      <div>
        <p>
          Email was not verified.{" "}
          <button onClick={handleResendClick}>Resend verification link.</button>
        </p>
      </div>
    );
  }

  if (state.matches("resendingVerification")) {
    return <p>Resending verification email</p>;
  }

  if (state.matches("resendVerificationSuccess")) {
    return (
      <div>
        <h1>Thank you!</h1>
        <p>We&apos;ve resent an email to {email}.</p>
        <p>Please click the link in that message to activate your account.</p>
        <p>
          Didn&apos;t receive the link?{" "}
          <button onClick={handleResendClick}>
            Click here to send another one.
          </button>
        </p>
      </div>
    );
  }

  if (state.matches("resendVerificationError")) {
    return (
      <div>
        <p>
          Something went wrong.{" "}
          <button onClick={handleResendClick}>
            Try resending verification email again.
          </button>
        </p>
      </div>
    );
  }

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
