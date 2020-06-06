import React from "react";
import Signup from "./index";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router-dom";

const server = setupServer(
  rest.post(`/api/users/`, (req, res, context) => {
    return res(context.delay(1500), context.json({ status: "ok" }));
  })
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function mountWithRouter() {
  render(
    <Router>
      <Signup />
    </Router>
  );
}

function signup() {
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "John" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "Doe" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  fireEvent.click(screen.getByText("Signup"));
}

it("should render sign up form", async () => {
  mountWithRouter();

  expect(screen.getByLabelText("First name")).toBeTruthy();
  expect(screen.getByLabelText("Last name")).toBeTruthy();
  expect(screen.getByLabelText("Email")).toBeTruthy();
  expect(screen.getByLabelText("Password")).toBeTruthy();
  expect(screen.getByText("Signup")).toBeTruthy();
});

it("should allow user to change input fields", async () => {
  mountWithRouter();

  const firstName = "John";
  const lastName = "Doe";
  const email = "johndoe@gmail.com";
  const password = "Thisisastrongpassword1";
  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: firstName },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: lastName },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });

  expect(screen.getByLabelText("First name").value).toEqual(firstName);
  expect(screen.getByLabelText("Last name").value).toEqual(lastName);
  expect(screen.getByLabelText("Email").value).toEqual(email);
  expect(screen.getByLabelText("Password").value).toEqual(password);
});

it("should render error if input fields are empty", async () => {
  mountWithRouter();

  fireEvent.click(screen.getByText("Signup"));

  expect(screen.getByText("First name is missing")).toBeTruthy();

  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "John" },
  });
  fireEvent.click(screen.getByText("Signup"));

  expect(screen.getByText("Last name is missing")).toBeTruthy();

  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "Doe" },
  });
  fireEvent.click(screen.getByText("Signup"));

  expect(screen.getByText("Email is missing")).toBeTruthy();

  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.click(screen.getByText("Signup"));

  expect(screen.getByText("Password is missing")).toBeTruthy();
});

it("should clear empty errors after user updates input fields", async () => {
  mountWithRouter();

  fireEvent.click(screen.getByText("Signup"));

  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "John" },
  });
  const firstNameError = screen.queryByText("First name is missing");
  expect(firstNameError).toBeNull();

  fireEvent.click(screen.getByText("Signup"));
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "Doe" },
  });
  const lastNameError = screen.queryByText("Last name is missing");
  expect(lastNameError).toBeNull();

  fireEvent.click(screen.getByText("Signup"));
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  const emailError = screen.queryByText("Email is missing");
  expect(emailError).toBeNull();

  fireEvent.click(screen.getByText("Signup"));
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "Thisisastrongpassword1" },
  });
  const passwordError = screen.queryByText("Password is missing");
  expect(passwordError).toBeNull();
});

it("should show errors if password is weak", async () => {
  mountWithRouter();

  fireEvent.change(screen.getByLabelText("First name"), {
    target: { value: "John" },
  });
  fireEvent.change(screen.getByLabelText("Last name"), {
    target: { value: "Doe" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "johndoe@gmail.com" },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByText("Signup"));

  expect(
    screen.getByText(/The password must be at least 10 characters long/)
  ).toBeTruthy();
});

it("should make correct API call", async () => {
  jest.spyOn(global, "fetch");

  mountWithRouter();

  signup();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toMatchInlineSnapshot(`"/api/users"`);
    expect(fetch.mock.calls[0][1]).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"user\\":{\\"firstName\\":\\"John\\",\\"lastName\\":\\"Doe\\",\\"email\\":\\"johndoe@gmail.com\\",\\"password\\":\\"Thisisastrongpassword1\\"}}",
        "headers": Object {
          "Content-Type": "application/json",
        },
        "method": "POST",
      }
    `);
  });
});

it("should render success page", async () => {
  server.use(
    rest.post(`/api/users/`, (req, res, context) => {
      return res(context.status(200), context.json({ status: "ok" }));
    })
  );

  mountWithRouter();

  signup();

  await waitFor(() => {
    expect(screen.getByText("Thank you!")).toBeTruthy();
  });

  expect(
    screen.getByText("You should be receiving an email at johndoe@gmail.com")
  ).toBeTruthy();

  expect(
    screen.getByText("Click here to resend the verification email")
  ).toBeTruthy();
});

it("should render error when email is already taken", async () => {
  server.use(
    rest.post(`/api/users/`, (req, res, context) => {
      return res(context.status(422), context.json({ email: "is taken" }));
    })
  );

  mountWithRouter();
  signup();

  await waitFor(() => {
    expect(screen.getByText("Email is already taken")).toBeTruthy();
  });

  expect(screen.getByText("Login")).toBeTruthy();
});

it("should render generic error when signup goes wrong", async () => {
  server.use(
    rest.post(`/api/users/`, (req, res, context) => {
      return res(
        context.status(422),
        context.json({ message: "Whoops. Something went wrong" })
      );
    })
  );

  mountWithRouter();
  signup();

  await waitFor(() => {
    expect(
      screen.getByText("Something went wrong. Try signing up again")
    ).toBeTruthy();
  });
});
