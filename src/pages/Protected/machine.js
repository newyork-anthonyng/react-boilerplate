import { Machine, assign } from "xstate";
import loadProfile from "./api";

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
        type: "final",
      },
      error: {
        type: "final",
      },
    },
  },
  {
    services: {
      loadProfile: loadProfile,
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
    },
  }
);

export default machine;
