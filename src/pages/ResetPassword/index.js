import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";
import { Link } from "react-router-dom";

function ResetPassword() {
  const [state, send] = useMachine(machine);

  const { password, passwordErrors } = state.context;

  const handlePasswordChange = (e) => {
    send({ type: "inputPassword", value: e.target.value });
  };
  const handleSubmit = (e) => {
    e.preventDefault();

    send({ type: "submit" });
  };

  if (state.matches("failure.invalid")) {
    return (
      <div>
        <p>Password not changed</p>
        <Link to="/forgot-password">Send another password reset</Link>
      </div>
    );
  }

  if (state.matches("failure.generic")) {
    return <div>Something went wrong. Refresh the page and try again.</div>;
  }

  if (state.matches("success")) {
    return (
      <div>
        <p>Password successfully changed</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Password{" "}
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </label>
        <button type="submit">Reset Password</button>
      </form>
      {state.matches("ready.password.error.isEmpty") && (
        <p>Password is missing</p>
      )}
      {state.matches("ready.password.error.isWeak") && (
        <ul>
          {passwordErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ResetPassword;
