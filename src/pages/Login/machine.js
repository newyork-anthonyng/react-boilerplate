import { Machine, assign } from "xstate";
import auth from "./api";
import { resendVerification } from "../Signup/api";

const machine = Machine(
  {
    id: "login",
    context: {
      email: "",
      password: "",
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

          password: {
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

          auth: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "unauthorized",
                states: {
                  unauthorized: {},
                },
              },
            },
          },
        },

        on: {
          INPUT_EMAIL: {
            actions: ["cacheEmail"],
            target: [
              "ready.email.noError",
              "ready.password.noError",
              "ready.auth.noError",
            ],
          },
          INPUT_PASSWORD: {
            actions: ["cachePassword"],
            target: [
              "ready.email.noError",
              "ready.password.noError",
              "ready.auth.noError",
            ],
          },
          SUBMIT: [
            {
              target: "ready.email.error.empty",
              cond: "emptyEmail",
            },
            {
              target: "ready.password.error.empty",
              cond: "emptyPassword",
            },
            {
              target: "submitting",
            },
          ],
        },
      },
      submitting: {
        invoke: {
          src: "login",
          onDone: "success",
          onError: [
            { cond: "isNotVerified", target: "notVerified" },
            { target: "ready.auth.error.unauthorized" },
          ],
        },
      },
      notVerified: {
        on: {
          RESEND_VERIFICATION: "resendingVerification",
        },
      },
      resendingVerification: {
        invoke: {
          src: "resendVerification",
          onDone: "resendVerificationSuccess",
          onError: [{ target: "resendVerificationError.generic" }],
        },
      },
      success: {
        type: "final",
      },
      resendVerificationSuccess: {
        on: {
          RESEND_VERIFICATION: {
            target: "resendingVerification",
          },
        },
      },
      resendVerificationError: {
        initial: "generic",
        states: {
          generic: {
            on: {
              RESEND_VERIFICATION: {
                target: "#login.resendingVerification",
              },
            },
          },
        },
      },
    },
  },
  {
    guards: {
      emptyEmail: (context) => context.email.trim().length === 0,
      emptyPassword: (context) => context.password.trim().length === 0,
      isNotVerified: (_, event) => {
        const { data } = event;

        return data.errors.verified === "user not verified";
      },
    },
    actions: {
      cacheEmail: assign({
        email: (context, event) => event.value,
      }),

      cachePassword: assign({
        password: (context, event) => event.value,
      }),
    },
    services: {
      login: (context) => {
        return auth.login({ email: context.email, password: context.password });
      },
      resendVerification: (context) => {
        return resendVerification({ email: context.email });
      },
    },
  }
);

export default machine;
