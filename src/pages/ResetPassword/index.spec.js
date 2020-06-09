import React from "react";
import { MemoryRouter as Router, Route } from "react-router-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import ResetPassword from "./index";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";

const server = setupServer(
  rest.post(`/api/users/reset-password`, (req, res, context) => {
    return res(context.delay(1500), context.json({}));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mountWithRouter() {
  render(
    <Router initialEntries={["/reset-password/abc123"]}>
      <Route path="/reset-password/:token">
        <ResetPassword />
      </Route>
    </Router>
  );
}

it("should render form", async () => {
  mountWithRouter();

  expect(screen.getByLabelText("Password")).toBeTruthy();
  expect(screen.getByText("Reset Password"));
});

it("should allow user to update email", async () => {
  mountWithRouter();

  const password = `ThisisastrongPassword1`;
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });

  expect(screen.getByLabelText("Password").value).toEqual(password);
});

it("should render error if password is empty", async () => {
  mountWithRouter();

  fireEvent.click(screen.getByText("Reset Password"));

  expect(screen.getByText("Password is missing")).toBeTruthy();
});

it("should render error if password is weak", async () => {
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByText("Reset Password"));

  expect(
    screen.getByText("The password must be at least 10 characters long.")
  ).toBeTruthy();
});

it("should make correct API call", async () => {
  jest.spyOn(global, "fetch");
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  fireEvent.click(screen.getByText("Reset Password"));

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toMatchInlineSnapshot(
    `"/api/users/reset-password"`
  );
  expect(fetch.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "body": "{\\"password\\":\\"Thisisastrongpassword1\\",\\"token\\":\\"abc123\\"}",
      "headers": Object {
        "Content-Type": "application/json",
      },
      "method": "POST",
    }
  `);
});

it("should show success screen", async () => {
  server.use(
    rest.post("/api/users/reset-password", (req, res, context) => {
      return res(context.status(200), context.json({ status: "ok" }));
    })
  );

  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  fireEvent.click(screen.getByText("Reset Password"));

  await waitFor(() => {
    expect(screen.getByText("Password successfully changed")).toBeTruthy();
  });

  expect(screen.getByText("Login")).toBeTruthy();
});

it("should show error screen if reset-password token is not valid", async () => {
  server.use(
    rest.post("/api/users/reset-password", (req, res, context) => {
      return res(
        context.status(422),
        context.json({
          message: "Reset password token expired.",
        })
      );
    })
  );
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  fireEvent.click(screen.getByText("Reset Password"));

  await waitFor(() => {
    expect(screen.getByText("Password not changed")).toBeTruthy();
  });

  expect(screen.getByText("Send another password reset")).toBeTruthy();
});

it("should show error screen if something went wrong", async () => {
  server.use(
    rest.post("/api/users/reset-password", (req, res, context) => {
      return res(
        context.status(422),
        context.json({
          message: "Whoops. Something went wrong",
        })
      );
    })
  );
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  fireEvent.click(screen.getByText("Reset Password"));

  await waitFor(() => {
    expect(
      screen.getByText("Something went wrong. Refresh the page and try again.")
    ).toBeTruthy();
  });
});
