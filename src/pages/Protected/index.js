import React from "react";
import { Redirect } from "react-router-dom";
import { useMachine } from "@xstate/react";
import machine from "./machine";

function ProtectedPage() {
  const [state, send] = useMachine(machine);
  const { firstName, lastName, email } = state.context;

  if (state.matches("loading")) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (state.matches("loggingOut")) {
    return (
      <div>
        <Redirect to="/login" />
      </div>
    );
  }

  function handleLogoutClick() {
    send({ type: "LOGOUT" });
  }

  if (state.matches("success")) {
    return (
      <div>
        <button onClick={handleLogoutClick}>Logout</button>
        <p>
          Name: {firstName} {lastName}
        </p>
        <p>Email: {email}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Private</h1>
    </div>
  );
}

export default ProtectedPage;
