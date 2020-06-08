import React from "react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import ForgotPassword from "./index";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";

const server = setupServer(
  rest.post(`/api/users/forgot-password`, (req, res, context) => {
    return res(context.delay(1500), context.json({ status: "ok" }));
  })
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("should render", async () => {
  render(<ForgotPassword />);

  expect(screen.getByLabelText("Email"));
  expect(screen.getByText("Submit"));
});

it("should allow user to update input fields", async () => {
  render(<ForgotPassword />);

  const email = "johndoe@gmail.com";
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });

  expect(screen.getByLabelText("Email").value).toEqual(email);
});

it("should show error if email is missing", async () => {
  render(<ForgotPassword />);

  fireEvent.click(screen.getByText("Submit"));

  expect(screen.getByText("Email is missing")).toBeTruthy();
});

it("should show error if user is not verified", async () => {
  server.use(
    rest.post(`/api/users/forgot-password`, (req, res, context) => {
      return res(
        context.status(422),
        context.json({ error: "User is not verified" })
      );
    })
  );
  render(<ForgotPassword />);

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    screen.getByText("Verify your email first");
  });

  expect(
    screen.getByText(
      "A verification email was sent to you. Make sure you verify your email first"
    )
  ).toBeTruthy();
});

it("should show error if API call fails", async () => {
  server.use(
    rest.post(`/api/users/forgot-password`, (req, res, context) => {
      return res(
        context.status(422),
        context.json({ error: "Something went wrong" })
      );
    })
  );
  render(<ForgotPassword />);

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(
      screen.getByText(
        "Something went wrong. Try refreshing and submitting again"
      )
    ).toBeTruthy();
  });
});

it("should make correct API call", async () => {
  jest.spyOn(global, "fetch");

  render(<ForgotPassword />);

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.click(screen.getByText("Submit"));

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toMatchInlineSnapshot(
    `"/api/users/forgot-password"`
  );
  expect(fetch.mock.calls[0][1]).toMatchInlineSnapshot(`
    Object {
      "body": "{\\"user\\":{\\"email\\":\\"johndoe@gmail.com\\"}}",
      "headers": Object {
        "Content-Type": "application/json",
      },
      "method": "POST",
    }
  `);
});

it("should show success page", async () => {
  server.use(
    rest.post(`/api/users/forgot-password`, (req, res, context) => {
      return res(context.status(200), context.json({ status: "ok" }));
    })
  );
  render(<ForgotPassword />);

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.click(screen.getByText("Submit"));

  await waitFor(() => {
    expect(
      screen.getByText("Check your email for password reset instructions")
    );
  });
});
