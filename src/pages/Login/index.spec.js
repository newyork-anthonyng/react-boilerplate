import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import LoginPage from "./index";

it("should render login form", async () => {
  render(<LoginPage />);

  expect(screen.getByLabelText("Email")).toBeDefined();
  expect(screen.getByLabelText("Password")).toBeDefined();
});

it("should be able to update email and password", async () => {
  render(<LoginPage />);

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

it("should show error if email is missing", async () => {
  render(<LoginPage />);

  const password = "Thisisastrongpassword1";
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });

  fireEvent.click(screen.getByRole("button"));

  expect(screen.getByText("Email is missing")).toBeTruthy();
});

it("should show error if password is missing", async () => {
  render(<LoginPage />);

  const email = "john.doe@gmail.com";
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });

  fireEvent.click(screen.getByRole("button"));

  expect(screen.getByText("Password is missing")).toBeTruthy();
});
