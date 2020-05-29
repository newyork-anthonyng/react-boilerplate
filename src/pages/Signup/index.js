import React from "react";
import machine from "./machine";
import { useMachine } from "@xstate/react";

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
