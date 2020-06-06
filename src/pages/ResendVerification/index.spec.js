import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import ResendVerification from "./index";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";

const server = setupServer(
  rest.post(`/api/users/resend-token`, (req, res, context) => {
    return res(context.delay(1500), context.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mountWithRouter() {
  render(
    <Router>
      <ResendVerification />
    </Router>
  );
}

it("should render form", async () => {
  mountWithRouter();

  expect(screen.getByLabelText("Email")).toBeTruthy();
});

it("should allow user to update form", async () => {
  mountWithRouter();

  const email = "johndoe@gmail.com";
  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: email,
    },
  });

  expect(screen.getByLabelText("Email").value).toEqual(email);
});

it("should render error if email is empty", async () => {
  jest.spyOn(global, "fetch");
  mountWithRouter();

  fireEvent.click(screen.getByText("Submit"));

  expect(screen.getByText("Email is missing")).toBeTruthy();
  expect(fetch).not.toHaveBeenCalled();
});

it("should clear email errors when user types", async () => {
  mountWithRouter();

  fireEvent.click(screen.getByText("Submit"));

  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: "johndoe@gmail.com",
    },
  });

  const emailError = screen.queryByText("Email is missing");
  expect(emailError).toBeNull();
});

it("should make correct fetch call", async () => {
  jest.spyOn(global, "fetch");

  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: "johndoe@gmail.com",
    },
  });

  fireEvent.click(screen.getByText("Submit"));

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toMatchInlineSnapshot(
    `"/api/users/resend-token"`
  );
  expect(fetch.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "body": "{\\"email\\":\\"johndoe@gmail.com\\"}",
      "headers": Object {
        "Content-Type": "application/json",
      },
      "method": "POST",
    }
  `);

  global.fetch.mockRestore();
});

it("should show success page", async () => {
  server.use(
    rest.post("/api/users/resend-token", (req, res, context) => {
      return res(context.status(200), context.json({}));
    })
  );
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: "johndoe@gmail.com",
    },
  });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => screen.getByText(/Submitting/));
  await waitFor(() => screen.getByText(/Verification email resent to/));

  expect(
    screen.getByText("Verification email resent to johndoe@gmail.com")
  ).toBeTruthy();
});

it("should show error page when user is already verified", async () => {
  server.use(
    rest.post("/api/users/resend-token", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ message: "User already verified" })
      );
    })
  );
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: "johndoe@gmail.com",
    },
  });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    screen.getByText(/User is already verified/);
  });

  expect(screen.getByText(/Log in/)).toBeTruthy();
});

it("should show error page when user is not found", async () => {
  server.use(
    rest.post("/api/users/resend-token", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ message: "User not found" })
      );
    })
  );
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: "johndoe@gmail.com",
    },
  });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    screen.getByText(/User not found/);
  });

  expect(screen.getByText(/User not found/)).toBeTruthy();
});

it("should show generic error page", async () => {
  server.use(
    rest.post("/api/users/resend-token", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ message: "Whoops. Something went wrong" })
      );
    })
  );
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Email"), {
    target: {
      value: "johndoe@gmail.com",
    },
  });

  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(
      screen.getByText("Something went wrong. Refresh the page and try again.")
    ).toBeTruthy();
  });
});
