const LOGIN_URL = `/api/users/login`;

function login({ email, password }) {
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
    .then(console.log);
}

export default login;
