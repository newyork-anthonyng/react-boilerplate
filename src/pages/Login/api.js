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
          resolve(response);
          auth.isAuthenticated = true;
        }
      })
      .catch((response) => {
        reject(response);
      });
  });
}

const auth = {
  isAuthenticated: false,
  login,
};

export default auth;
