import { Machine } from "xstate";

const CONFIRMATION_URL = `/api/users/confirmation`;
function verifyEmailApi(token) {
  return new Promise((resolve, reject) =>
    fetch(CONFIRMATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    }).then(async (response) => {
      if (!response.ok) {
        return reject(await response.json());
      }
      return resolve(response.json());
    })
  );
}

const machine = (token) =>
  Machine(
    {
      id: "emailVerification",
      initial: "loading",
      context: {
        token,
      },
      states: {
        loading: {
          invoke: {
            src: "verifyEmail",
            onDone: "success",
            onError: [
              { cond: "isEmailVerified", target: "error.alreadyVerified" },
              { cond: "isUserMissing", target: "error.userMissing" },
              { cond: "isTokenExpired", target: "error.tokenExpired" },
              { target: "error.generic" },
            ],
          },
        },
        success: {},
        error: {
          initial: "generic",
          states: {
            generic: {},
            alreadyVerified: {},
            userMissing: {},
            tokenExpired: {},
          },
        },
      },
    },
    {
      guards: {
        isEmailVerified: (_, event) => {
          return event.data.error === "User already verified";
        },
        isUserMissing: (_, event) => {
          return event.data.error === "User not found";
        },
        isTokenExpired: (_, event) => {
          return event.data.error === "Token not found";
        },
      },
      services: {
        verifyEmail: (context) => {
          return verifyEmailApi(context.token);
        },
      },
    }
  );

export default machine;
