import React from "react";
import { render } from "react-dom";
import "./styles.css";
import Login from "./pages/Login/index";

function App() {
  return <Login />;
}

render(<App />, document.querySelector(".js-root"));
