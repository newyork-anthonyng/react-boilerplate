import { Machine, assign } from "xstate";

const FORGOT_PASSWORD_URL = `/api/users/forgot-password`;
function forgotPasswordApi(email) {
  return new Promise((resolve, reject) => {
    fetch(FORGOT_PASSWORD_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email,
        },
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          return reject(await response.json());
        } else {
          return response.json();
        }
      })
      .then((response) => {
        return resolve(response);
      });
  });
}

const machine = Machine(
  {
    id: "forgotPassword",
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
              error: {
                initial: "empty",
                states: {
                  empty: {},
                },
              },
            },
          },
        },

        on: {
          inputEmail: {
            actions: ["cacheEmail"],
          },
          submit: [
            { cond: "isEmailEmpty", target: "ready.email.error.empty" },
            { target: "submitting" },
          ],
        },
      },
      submitting: {
        invoke: {
          src: "forgotPassword",
          onDone: "success",
          onError: [
            { cond: "isNotVerified", target: "failure.notVerified" },
            { target: "failure.generic" },
          ],
        },
      },
      success: {
        type: "final",
      },
      failure: {
        initial: "generic",
        states: {
          generic: {},
          notVerified: {},
        },
      },
    },
  },
  {
    services: {
      forgotPassword: (context) => {
        return forgotPasswordApi(context.email);
      },
    },
    guards: {
      isEmailEmpty: (context) => context.email.trim().length === 0,
      isNotVerified: (_, event) => {
        return event.data.error === "User is not verified";
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
