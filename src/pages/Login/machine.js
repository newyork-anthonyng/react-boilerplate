import { Machine, assign } from "xstate";
import login from "./api";

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
        },

        on: {
          INPUT_EMAIL: { actions: ["cacheEmail"] },
          INPUT_PASSWORD: { actions: ["cachePassword"] },
          SUBMIT: { actions: ["submit"] },
        },
      },
      submitting: {},
      success: {},
    },
  },
  {
    actions: {
      cacheEmail: assign({
        email: (context, event) => event.value,
      }),

      cachePassword: assign({
        password: (context, event) => event.value,
      }),

      submit: (context) => {
        console.group("submit");
        console.log(context.email, context.password);
        console.groupEnd("submit");
      },
    },
  }
);

export default machine;
