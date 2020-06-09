import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
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

it("should render form", async () => {
  render(<ResetPassword />);

  expect(screen.getByLabelText("Password")).toBeTruthy();
  expect(screen.getByText("Reset Password"));
});

it("should allow user to update email", async () => {
  render(<ResetPassword />);

  const password = `ThisisastrongPassword1`;
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });

  expect(screen.getByLabelText("Password").value).toEqual(password);
});

it("should render error if password is empty", async () => {
  render(<ResetPassword />);

  fireEvent.click(screen.getByText("Reset Password"));

  expect(screen.getByText("Password is missing")).toBeTruthy();
});

it("should render error if password is weak", async () => {
  render(<ResetPassword />);

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
  render(<ResetPassword />);

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
      "body": "{\\"user\\":{\\"password\\":\\"Thisisastrongpassword1\\"}}",
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

  render(
    <Router>
      <ResetPassword />
    </Router>
  );

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
  render(
    <Router>
      <ResetPassword />
    </Router>
  );

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
  render(<ResetPassword />);

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
