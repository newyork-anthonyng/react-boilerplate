import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";

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

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <input type="text" onChange={handleEmailChange} value={email}></input>
        <input
          type="password"
          onChange={handlePasswordChange}
          value={password}
        ></input>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;
