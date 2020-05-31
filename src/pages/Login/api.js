import auth from "../auth";
const LOGIN_URL = `/api/users/login`;

function login({ email, password }) {
  return new Promise((resolve, reject) => {
    fetch(LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          email,
          password,
        },
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.errors) {
          reject(response);
        } else {
          auth.saveJWT({
            token: response.user.token,
            refreshToken: response.user.refreshToken,
          });

          resolve(response);
        }
      })
      .catch((response) => {
        reject(response);
      });
  });
}

export default login;
