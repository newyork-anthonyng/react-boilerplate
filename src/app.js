import React, { useState, useEffect } from "react";
import { render } from "react-dom";
import "./styles.css";
import Login from "./pages/Login/index";
import Signup from "./pages/Signup/index";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link,
} from "react-router-dom";
import auth from "./pages/Login/api";
import PropTypes from "prop-types";

function ProtectedPage() {
  return (
    <div>
      <h1>Private</h1>
    </div>
  );
}

function DelayedRedirect(props) {
  const [timeToRedirect, setTimeToRedirect] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeToRedirect((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeToRedirect < 0) {
    return <Redirect {...props} />;
  }

  return (
    <div>
      You need to login to view this page. Redirecting to login page in{" "}
      {timeToRedirect}
    </div>
  );
}

function PrivateRoute({ children, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.isAuthenticated ? (
          children
        ) : (
          <DelayedRedirect
            to={{ pathname: "/login", state: { from: location } }}
          />
        )
      }
    />
  );
}

PrivateRoute.propTypes = {
  children: PropTypes.element,
};

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/signup">Signup</Link>
          </li>
          <li>
            <Link to="/protected">Protected route</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>

        <Route path="/signup">
          <Signup />
        </Route>

        <PrivateRoute path="/protected">
          <ProtectedPage />
        </PrivateRoute>

        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    </Router>
  );
}

render(<App />, document.querySelector(".js-root"));
