const SIGNUP_URL = `/api/users`;

function signup({ firstName, lastName, email, password }) {
  return new Promise((resolve, reject) => {
    fetch(SIGNUP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: {
          firstName,
          lastName,
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
        }
      })
      .catch((response) => {
        reject(response);
      });
  });
}

export default signup;
