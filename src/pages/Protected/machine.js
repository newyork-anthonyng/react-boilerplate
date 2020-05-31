import { Machine, assign } from "xstate";
import loadProfile from "./api";
import auth from "../auth";

const machine = Machine(
  {
    id: "protected",
    context: {
      firstName: "",
      lastName: "",
      email: "",
    },
    initial: "loading",
    states: {
      loading: {
        invoke: {
          src: "loadProfile",
          onDone: {
            actions: ["cacheResult"],
            target: "success",
          },
          onError: "error",
        },
      },
      success: {
        on: {
          LOGOUT: {
            actions: ["logout"],
            target: "loggingOut",
          },
        },
      },
      error: {
        type: "final",
      },
      loggingOut: {},
    },
  },
  {
    services: {
      loadProfile,
    },
    actions: {
      cacheResult: assign((_, event) => {
        const {
          data: {
            user: { email, firstName, lastName },
          },
        } = event;

        return {
          email,
          firstName,
          lastName,
        };
      }),
      logout: () => auth.logout(),
    },
  }
);

export default machine;
