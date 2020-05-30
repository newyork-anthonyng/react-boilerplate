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

const RESEND_VERIFICATION_URL = "/api/users/resend-token";
function resendVerification({ email }) {
  return new Promise((resolve, reject) => {
    fetch(RESEND_VERIFICATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        resolve(response);
      })
      .catch((response) => {
        reject(response);
      });
  });
}

export { signup, resendVerification };
