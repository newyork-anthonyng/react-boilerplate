import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";
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

  const handleFirstNameChange = (e) => {
    send({ type: "inputFirstName", value: e.target.value });
  };
  const handleLastNameChange = (e) => {
    send({ type: "inputLastName", value: e.target.value });
  };
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
    return (
      <div>
        <p>Thank you!</p>
        <p>You should be receiving an email at {email}</p>
        <Link to="/resend-verification">
          Click here to resend the verification email
        </Link>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          First name
          <input value={firstName} onChange={handleFirstNameChange} />
        </label>
        <label>
          Last name
          <input value={lastName} onChange={handleLastNameChange} />
        </label>
        <label>
          Email
          <input value={email} onChange={handleEmailChange} />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>

        <button type="submit">Signup</button>
      </form>

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
        <div>
          <p>Email is already taken</p>
          <Link to="/login">Login</Link>
        </div>
      )}
      {state.matches("ready.auth.error.generic") && (
        <p>Something went wrong. Try signing up again</p>
      )}
    </div>
  );
}

export default Signup;
