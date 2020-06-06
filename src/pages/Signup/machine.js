import { Machine, assign } from "xstate";
import passwordChecker from "owasp-password-strength-test";

const SIGNUP_URL = `/api/users`;
function signupApi({ firstName, lastName, email, password }) {
  return new Promise((resolve, reject) => {
    fetch(SIGNUP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          firstName,
          lastName,
          email,
          password,
        },
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
        type: "parallel",
        states: {
          firstName: {
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
          lastName: {
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
                initial: "generic",
                states: {
                  generic: {},
                  emailTaken: {},
                },
              },
            },
          },
        },
        on: {
          inputFirstName: {
            actions: ["cacheFirstName"],
            target: ["ready.firstName.noError"],
          },
          inputLastName: {
            actions: ["cacheLastName"],
            target: ["ready.lastName.noError"],
          },
          inputEmail: {
            actions: ["cacheEmail"],
            target: ["ready.email.noError"],
          },
          inputPassword: {
            actions: ["cachePassword"],
            target: ["ready.password.noError"],
          },
          submit: [
            { cond: "isFirstNameEmpty", target: "ready.firstName.error.empty" },
            { cond: "isLastNameEmpty", target: "ready.lastName.error.empty" },
            { cond: "isEmailEmpty", target: "ready.email.error.empty" },
            { cond: "isPasswordEmpty", target: "ready.password.error.empty" },
            {
              cond: "isPasswordWeak",
              actions: ["cachePasswordErrors"],
              target: "ready.password.error.weak",
            },
            { target: "submitting" },
          ],
        },
      },
      submitting: {
        invoke: {
          src: "signup",
          onDone: "success",
          onError: [
            {
              cond: "isEmailTaken",
              actions: [],
              target: "ready.auth.error.emailTaken",
            },
            { target: "ready.auth.error.generic" },
          ],
        },
      },

      success: {},
    },
  },
  {
    services: {
      signup: ({ firstName, lastName, email, password }) => {
        return signupApi({ firstName, lastName, email, password });
      },
    },
    guards: {
      isFirstNameEmpty: (context) => context.firstName.trim().length === 0,
      isLastNameEmpty: (context) => context.lastName.trim().length === 0,
      isEmailEmpty: (context) => context.email.trim().length === 0,
      isPasswordEmpty: (context) => context.password.trim().length === 0,
      isPasswordWeak: (context) => {
        const passwordResult = passwordChecker.test(context.password);
        const isPasswordWeak = passwordResult.errors.length > 0;

        return isPasswordWeak;
      },
      isEmailTaken: (_, event) => {
        return event.data.email === "is taken";
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
          return passwordChecker.test(context.password).errors;
        },
      }),
    },
  }
);

export default machine;
