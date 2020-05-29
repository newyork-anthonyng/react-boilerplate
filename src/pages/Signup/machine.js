import { Machine, assign } from "xstate";
import signup from "./api";
import passwordChecker from "owasp-password-strength-test";

const machine = Machine(
  {
    id: "signup",
    context: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      passwordErrors: [],
    },
    initial: "ready",
    states: {
      ready: {
        on: {
          INPUT_FIRST_NAME: {
            target: ["ready.firstName.noError"],
            actions: ["cacheFirstName"],
          },
          INPUT_LAST_NAME: {
            target: ["ready.lastName.noError"],
            actions: ["cacheLastName"],
          },
          INPUT_EMAIL: {
            target: ["ready.email.noError"],
            actions: ["cacheEmail"],
          },
          INPUT_PASSWORD: {
            target: ["ready.password.noError"],
            actions: ["cachePassword"],
          },
          SUBMIT: [
            { cond: "emptyFirstName", target: "ready.firstName.error.empty" },
            { cond: "emptyLastName", target: "ready.lastName.error.empty" },
            { cond: "emptyEmail", target: "ready.email.error.empty" },
            { cond: "emptyPassword", target: "ready.password.error.empty" },
            {
              cond: "weakPassword",
              actions: ["cachePasswordErrors"],
              target: "ready.password.error.weak",
            },
            { target: "submitting" },
          ],
        },

        type: "parallel",
        states: {
          firstName: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "empty",
                states: { empty: {} },
              },
            },
          },
          lastName: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "empty",
                states: { empty: {} },
              },
            },
          },
          email: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "empty",
                states: { empty: {} },
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
                  weak: {},
                },
              },
            },
          },
          auth: {
            initial: "noError",
            states: {
              noError: {},
              error: {
                initial: "emailTaken",
                states: {
                  emailTaken: {},
                },
              },
            },
          },
        },
      },
      submitting: {
        invoke: {
          src: "signup",
          onDone: "success",
          onError: "ready.auth.error.emailTaken",
        },
      },
      success: {},
    },
  },
  {
    guards: {
      emptyFirstName: (context) => context.firstName.trim().length === 0,
      emptyLastName: (context) => context.lastName.trim().length === 0,
      emptyEmail: (context) => context.email.trim().length === 0,
      emptyPassword: (context) => context.password.trim().length === 0,
      weakPassword: (context) => {
        const passwordResult = passwordChecker.test(context.password);
        const isPasswordWeak = passwordResult.errors.length > 0;

        return isPasswordWeak;
      },
    },
    actions: {
      cacheFirstName: assign({
        firstName: (_, event) => event.value,
      }),
      cacheLastName: assign({
        lastName: (_, event) => event.value,
      }),
      cacheEmail: assign({
        email: (_, event) => event.value,
      }),
      cachePassword: assign({
        password: (_, event) => event.value,
      }),
      cachePasswordErrors: assign({
        passwordErrors: (context) => {
          const passwordResult = passwordChecker.test(context.password);

          return passwordResult.errors;
        },
      }),
    },
    services: {
      signup: (context) => {
        return signup({
          firstName: context.firstName,
          lastName: context.lastName,
          email: context.email,
          password: context.password,
        });
      },
    },
  }
);

export default machine;
