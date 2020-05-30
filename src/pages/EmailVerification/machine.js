import { Machine } from "xstate";
import api from "./api";

const machine = (token) =>
  Machine(
    {
      id: "emailVerification",
      context: {
        token,
      },
      initial: "loading",
      states: {
        loading: {
          invoke: {
            src: "verifyEmail",
            onDone: "success",
            onError: [
              { cond: "isExpired", target: "failure.expired" },
              { cond: "wasAlreadyVerified", target: "failure.alreadyVerified" },
              { cond: "wasUserNotFound", target: "failure.userNotFound" },
            ],
          },
        },
        success: {
          type: "final",
        },
        failure: {
          initial: "expired",

          states: {
            expired: {},
            alreadyVerified: {},
            userNotFound: {},
          },
        },
      },
    },
    {
      guards: {
        isExpired: (_, event) => {
          return event.data.error === "Token not found";
        },
        wasAlreadyVerified: (_, event) => {
          return event.data.error === "User already verified";
        },
        wasUserNotFound: (_, event) => {
          return event.data.error === "User not found";
        },
      },
      services: {
        verifyEmail: (context) => {
          return api(context.token);
        },
      },
    }
  );

export default machine;
