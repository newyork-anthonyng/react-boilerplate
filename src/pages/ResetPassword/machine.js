import { Machine, assign } from "xstate";
import passwordChecker from "owasp-password-strength-test";

const RESET_PASSWORD = `/api/users/reset-password`;
function resetPasswordApi({ password, token }) {
  return new Promise((resolve, reject) => {
    fetch(RESET_PASSWORD, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        token,
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

const machine = (token) =>
  Machine(
    {
      id: "resetPassword",
      context: {
        password: "",
        passwordErrors: [],
        token,
      },
      initial: "ready",
      states: {
        ready: {
          type: "parallel",

          states: {
            password: {
              initial: "noError",
              states: {
                noError: {},
                error: {
                  initial: "isEmpty",
                  states: {
                    isEmpty: {},
                    isWeak: {},
                  },
                },
              },
            },
          },
          on: {
            inputPassword: {
              actions: ["cachePassword"],
            },
            submit: [
              {
                cond: "isPasswordEmpty",
                target: "ready.password.error.isEmpty",
              },
              {
                cond: "isPasswordWeak",
                actions: ["cachePasswordErrors"],
                target: "ready.password.error.isWeak",
              },
              { target: "submitting" },
            ],
          },
        },
        submitting: {
          invoke: {
            src: "resetPassword",
            onDone: "success",
            onError: [
              { cond: "isTokenInvalid", target: "failure.invalid" },
              { target: "failure.generic" },
            ],
          },
        },
        success: {},
        failure: {
          initial: "generic",
          states: {
            generic: {},
            invalid: {},
          },
        },
      },
    },
    {
      services: {
        resetPassword: ({ password, token }) => {
          return resetPasswordApi({ password, token });
        },
      },
      guards: {
        isPasswordEmpty: (context) => context.password.trim().length === 0,
        isPasswordWeak: (context) => {
          const passwordResult = passwordChecker.test(context.password);
          const isPasswordWeak = passwordResult.errors.length > 0;

          return isPasswordWeak;
        },
        isTokenInvalid: (_, event) => {
          return event.data.message === "Reset password token expired.";
        },
      },
      actions: {
        cachePassword: assign({
          password: (_, event) => event.value,
        }),
        cachePasswordErrors: assign({
          passwordErrors: (context) => {
            const result = passwordChecker.test(context.password);
            return result.errors;
          },
        }),
      },
    }
  );

export default machine;
