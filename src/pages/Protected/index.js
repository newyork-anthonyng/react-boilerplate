import React from "react";
import { useMachine } from "@xstate/react";
import machine from "./machine";

function ProtectedPage() {
  const [state] = useMachine(machine);
  const { firstName, lastName, email } = state.context;

  if (state.matches("loading")) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (state.matches("success")) {
    return (
      <div>
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
