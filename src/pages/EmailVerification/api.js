const CONFIRMATION_URL = `/api/users/confirmation`;

function confirm(token) {
  return new Promise((resolve, reject) => {
    fetch(CONFIRMATION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    })
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        if (response.error) {
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

export default confirm;
