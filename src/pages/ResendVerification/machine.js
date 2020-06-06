import { Machine, assign } from "xstate";

const RESEND_VERIFICATION_URL = "/api/users/resend-token";
function resendVerificationApi(email) {
  return new Promise((resolve, reject) => {
    fetch(RESEND_VERIFICATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return reject(await response.json());
        }
        return response.json();
      })
      .then((response) => {
        resolve(response);
      });
  });
}

const machine = Machine(
  {
    id: "resendVerification",
    context: {
      email: "",
    },
    initial: "ready",
    states: {
      ready: {
        type: "parallel",

        states: {
          email: {
            initial: "noError",
            states: {
              noError: {},
              empty: {},
            },
          },
          //   auth: {
          //     initial: "noError",
          //     states: {
          //       noError: {},
          //       error: {},
          //     },
          //   },
        },

        on: {
          inputEmail: {
            actions: ["cacheEmail"],
            target: ["ready.email.noError"],
          },

          submit: [
            { cond: "isEmailEmpty", target: "ready.email.empty" },
            { target: "submitting" },
          ],
        },
      },
      submitting: {
        invoke: {
          src: "resendVerification",
          onDone: "success",
          onError: [
            { cond: "isAlreadyVerified", target: "failure.alreadyVerified" },
            { cond: "isUserNotFound", target: "failure.missingUser" },
            { target: "failure.generic" },
          ],
        },
      },
      success: {},
      failure: {
        initial: "generic",
        states: {
          generic: {},
          alreadyVerified: {},
          missingUser: {},
        },
      },
    },
  },
  {
    services: {
      resendVerification: (context) => {
        return resendVerificationApi(context.email);
      },
    },
    guards: {
      isEmailEmpty: (context) => {
        return context.email.trim().length === 0;
      },
      isAlreadyVerified: (_, event) => {
        return event.data.message === "User already verified";
      },
      isUserNotFound: (_, event) => {
        return event.data.message === "User not found";
      },
    },
    actions: {
      cacheEmail: assign({
        email: (_, event) => event.value,
      }),
    },
  }
);

export default machine;
