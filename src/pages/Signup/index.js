import React from "react";
import machine from "./machine";
import { useMachine } from "@xstate/react";
import { Link } from "react-router-dom";

function Signup() {
  const [state, send] = useMachine(machine);
  const {
    firstName,
    lastName,
    email,
    password,
    passwordErrors,
  } = state.context;

  const handleSubmit = (e) => {
    e.preventDefault();
    send({ type: "SUBMIT" });
  };

  const handleFirstNameChange = (e) => {
    send({ type: "INPUT_FIRST_NAME", value: e.target.value });
  };

  const handleLastNameChange = (e) => {
    send({ type: "INPUT_LAST_NAME", value: e.target.value });
  };

  const handleEmailChange = (e) => {
    send({ type: "INPUT_EMAIL", value: e.target.value });
  };

  const handlePasswordChange = (e) => {
    send({ type: "INPUT_PASSWORD", value: e.target.value });
  };

  const handleResendClick = () => {
    send({ type: "RESEND_VERIFICATION" });
  };

  if (state.matches("success") || state.matches("resendVerificationSuccess")) {
    return (
      <div>
        <h1>Thank you!</h1>
        <p>
          We&apos;ve {state.matches("resendVerificationSuccess") ? "re" : ""}
          sent an email to {email}.
        </p>
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

  if (state.matches("resendingVerification")) {
    return <p>Resending email confirmation...</p>;
  }

  if (state.matches("resendingVerificationError")) {
    return (
      <div>
        {state.matches("resendVerificationError.generic") && (
          <p>
            Something went wrong.{" "}
            <button onClick={handleResendClick}>
              Try resending verification email again.
            </button>
          </p>
        )}
        {state.matches("resendVerificationError.alreadyVerified") && (
          <p>
            Your email was already verified.{" "}
            <Link to="/login">Click here to login.</Link>
          </p>
        )}
        {state.matches("userNotFound") && (
          <p>Account for {email} was not found.</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label className="block">
          First name
          <input
            type="text"
            value={firstName}
            onChange={handleFirstNameChange}
          />
        </label>
        <label className="block">
          Last name{" "}
          <input type="text" value={lastName} onChange={handleLastNameChange} />
        </label>
        <label className="block">
          Email
          <input type="text" value={email} onChange={handleEmailChange} />
        </label>
        <label className="block">
          Password
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>

        <button type="submit" disabled={!state.matches("ready")}>
          Signup
        </button>
      </form>
      <div>
        {state.matches("ready.firstName.error.empty") && (
          <p>First name is missing</p>
        )}
        {state.matches("ready.lastName.error.empty") && (
          <p>Last name is missing</p>
        )}
        {state.matches("ready.email.error.empty") && <p>Email is missing</p>}
        {state.matches("ready.password.error.empty") && (
          <p>Password is missing</p>
        )}
        {state.matches("ready.password.error.weak") && (
          <ul>
            {passwordErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
        {state.matches("ready.auth.error.emailTaken") && (
          <p>Email already taken.</p>
        )}
      </div>
    </div>
  );
}

export default Signup;
