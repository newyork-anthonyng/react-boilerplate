import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import Login from "./index";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter as Router, Route, Switch } from "react-router-dom";
import auth from "../auth";

const server = setupServer(
  rest.post(`/api/users/login`, (req, res, context) => {
    return res(context.delay(1500), context.json({ user: {} }));
  })
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mountComponentWithRouter() {
  function ProtectedPage() {
    return <h1>Protected page</h1>;
  }
  render(
    <Router>
      <Switch>
        <Route path="/protected">
          <ProtectedPage />
        </Route>
        <Route>
          <Login />
        </Route>
      </Switch>
    </Router>
  );
}

function login() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  fireEvent.click(screen.getByText("Login"));
}

it("should render", async () => {
  mountComponentWithRouter();

  expect(screen.getByLabelText("Email")).toBeTruthy();
  expect(screen.getByLabelText("Password")).toBeTruthy();
  expect(screen.getByText("Login")).toBeTruthy();
});

it("should allow user to update email and password fields", async () => {
  mountComponentWithRouter();

  const email = "johndoe@gmail.com";
  const password = "Thisisastrongpassword1";
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });

  expect(screen.getByLabelText("Email").value).toEqual(email);
  expect(screen.getByLabelText("Password").value).toEqual(password);
});

it("should render error if email is empty", async () => {
  mountComponentWithRouter();

  const password = "Thisisastrongpassword1";
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });

  fireEvent.click(screen.getByText("Login"));

  expect(screen.getByText("Email is empty")).toBeTruthy();
});

it("should render error if password is empty", async () => {
  mountComponentWithRouter();

  const email = "johndoe@gmail.com";
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });

  fireEvent.click(screen.getByText("Login"));

  expect(screen.getByText("Password is empty")).toBeTruthy();
});

it("should clear errors when user types", async () => {
  mountComponentWithRouter();

  fireEvent.click(screen.getByText("Login"));

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });

  const emailError = screen.queryByText("Email is empty");
  expect(emailError).toBeNull();
  const passwordError = screen.queryByText("Password is empty");
  expect(passwordError).toBeNull();
});

it("should make correct API call", async () => {
  jest.spyOn(global, "fetch");

  mountComponentWithRouter();

  login();

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toMatchInlineSnapshot(`"/api/users/login"`);
  expect(fetch.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "body": "{\\"user\\":{\\"email\\":\\"johndoe@gmail.com\\",\\"password\\":\\"Thisisastrongpassword1\\"}}",
      "headers": Object {
        "Content-Type": "application/json",
      },
      "method": "POST",
    }
  `);
});

it("should redirect user", async () => {
  server.use(
    rest.post(`/api/users/login`, (req, res, context) => {
      return res(context.status(200), context.json({ user: {} }));
    })
  );
  mountComponentWithRouter();

  login();

  await waitFor(() => {
    expect(screen.getByText("Protected page")).toBeTruthy();
  });
});

it("should cache jwt tokens", async () => {
  auth.saveJWT = jest.fn();
  server.use(
    rest.post(`/api/users/login`, (req, res, context) => {
      return res(
        context.status(200),
        context.json({
          user: {
            token: "some.jwt.token",
            refreshToken: "another.jwt.token",
          },
        })
      );
    })
  );
  mountComponentWithRouter();

  login();

  await waitFor(() => {
    screen.getByText("Protected page");
  });

  expect(auth.saveJWT).toHaveBeenCalledTimes(1);
  expect(auth.saveJWT.mock.calls[0][0]).toMatchInlineSnapshot(`
    Object {
      "refreshToken": "another.jwt.token",
      "token": "some.jwt.token",
    }
  `);
});

it("should show error if user is not verified", async () => {
  server.use(
    rest.post(`/api/users/login`, (req, res, context) => {
      return res(
        context.status(401),
        context.json({
          errors: {
            verified: "user not verified",
          },
        })
      );
    })
  );
  mountComponentWithRouter();

  login();

  await waitFor(() => screen.getByText("Email is not verified"));

  expect(screen.getByText(`Click here to send again.`));
});

it("should show error if email/password combination is not valid", async () => {
  server.use(
    rest.post(`/api/users/login`, (req, res, context) => {
      return res(
        context.status(422),
        context.json({
          errors: {
            email: "Email/password combination is invalid",
          },
        })
      );
    })
  );
  mountComponentWithRouter();

  login();

  await waitFor(() => {
    expect(screen.getByText("Email/password combination is incorrect"));
  });
});
