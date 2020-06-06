import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import EmailVerification from "./index";
import { render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter as Router, Route } from "react-router-dom";

const server = setupServer(
  rest.post(`/api/users/confirmation`, (req, res, context) => {
    return res(context.delay(1500), context.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mountEmailVerification() {
  render(
    <Router initialEntries={["/confirmation/abc123"]}>
      <Route path="/confirmation/:token">
        <EmailVerification />
      </Route>
    </Router>
  );
}

it("should initially render loading screen", async () => {
  mountEmailVerification();

  expect(screen.getByText("Loading...")).toBeTruthy();
});

it("should make correct fetch call", async () => {
  jest.spyOn(global, "fetch");

  mountEmailVerification();

  expect(fetch.mock.calls[0][0]).toMatchInlineSnapshot(
    `"/api/users/confirmation"`
  );
  expect(fetch.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "body": "{\\"token\\":\\"abc123\\"}",
      "headers": Object {
        "Content-Type": "application/json",
      },
      "method": "POST",
    }
  `);
});

it("should render success screen if email was verified successfully", async () => {
  server.use(
    rest.post("/api/users/confirmation", (req, res, context) => {
      return res(context.json({ foo: "bar" }));
    })
  );
  mountEmailVerification();

  await waitFor(() => {
    screen.getByText(/Email successfully verified/);
  });

  expect(screen.getByText(/Log in/)).toBeTruthy();
});

it("should render error if email was already verified", async () => {
  server.use(
    rest.post("/api/users/confirmation", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ error: "User already verified" })
      );
    })
  );

  mountEmailVerification();

  await waitFor(() => {
    screen.getByText("Email already verified");
  });
  expect(screen.getByText(/Log in/)).toBeTruthy();
});

it("should render error if user not found", async () => {
  server.use(
    rest.post("/api/users/confirmation", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ error: "User not found" })
      );
    })
  );

  mountEmailVerification();

  await waitFor(() => {
    expect(screen.getByText(/User not found/)).toBeTruthy();
  });
});

it("should render error if token has expired", async () => {
  server.use(
    rest.post("/api/users/confirmation", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ error: "Token not found" })
      );
    })
  );

  mountEmailVerification();

  await waitFor(() => {
    expect(screen.getByText(/Email verification expired/)).toBeTruthy();
    expect(screen.getByText("Send another verification email")).toBeTruthy();
  });
});

it("should render generic error", async () => {
  server.use(
    rest.post("/api/users/confirmation", (req, res, context) => {
      return res(
        context.status(400),
        context.json({ error: "Whoops. Unknown error" })
      );
    })
  );

  mountEmailVerification();

  await waitFor(() => {
    expect(
      screen.getByText(/Something weird happened. Try refreshing the page/)
    ).toBeTruthy();
  });
});
