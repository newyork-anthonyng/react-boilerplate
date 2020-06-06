import { Machine, assign } from "xstate";
import auth from "../auth";

const LOGIN_URL = `/api/users/login`;
function loginApi({ email, password }) {
  return new Promise((resolve, reject) => {
    fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email,
          password,
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
        if (response && response.user) {
          auth.saveJWT({
            token: response.user.token,
            refreshToken: response.user.refreshToken,
          });
        }

        return resolve(response);
      });
  });
}

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
              empty: {},
            },
          },
          password: {
            initial: "noError",
            states: {
              noError: {},
              empty: {},
            },
          },

          auth: {
            initial: "noError",
            states: {
              noError: {},
              notVerified: {},
              unauthorized: {},
            },
          },
        },
        on: {
          inputEmail: {
            actions: ["cacheEmail"],
            target: ["ready.email.noError"],
          },
          inputPassword: {
            actions: ["cachePassword"],
            target: ["ready.password.noError"],
          },
          submit: [
            { cond: "isEmailEmpty", target: "ready.email.empty" },
            { cond: "isPasswordEmpty", target: "ready.password.empty" },
            { target: "submitting" },
          ],
        },
      },
      submitting: {
        invoke: {
          src: "login",
          onDone: "success",
          onError: [
            { cond: "isUserNotVerified", target: "ready.auth.notVerified" },
            {
              cond: "isEmailPasswordInvalid",
              target: "ready.auth.unauthorized",
            },
          ],
        },
      },
      success: {},
    },
  },
  {
    services: {
      login: ({ email, password }) => loginApi({ email, password }),
    },
    guards: {
      isEmailEmpty: (context) => context.email.trim().length === 0,
      isPasswordEmpty: (context) => context.password.trim().length === 0,
      isUserNotVerified: (_, event) => {
        return !!event.data.errors.verified;
      },
      isEmailPasswordInvalid: (_, event) => {
        return (
          event.data.errors.email === "Email/password combination is invalid"
        );
      },
    },
    actions: {
      cacheEmail: assign({
        email: (_, event) => event.value,
      }),
      cachePassword: assign({
        password: (_, event) => event.value,
      }),
    },
  }
);

export default machine;
