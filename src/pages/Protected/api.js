const PROFILE_URL = `/api/users/me`;
import auth from "../auth";

function profile() {
  return new Promise((resolve, reject) => {
    fetch(PROFILE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-token": auth.token,
        "x-refresh-token": auth.refreshToken,
      },
    })
      .then((response) => {
        auth.inspectHeaders(response.headers);
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

export default profile;
