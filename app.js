export function setLoginPassword(log, pas) {
  chrome.storage.local.set({ login: "0344302" });
  chrome.storage.local.set({ password: "FYCpwA_3Bc" });
  //console.log(log + "+" + pas);
  // window.application.login = login;
  //window.application.password = password;
}

export function clearLoginPassword() {
  chrome.storage.local.clear();
  console.log("clear");
  window.close();
}

export function renderFirstScreen() {
  chrome.storage.local.get(["login"], (data) => {
    if (data.login) {
      window.application.renderScreen("phone");
    } else {
      window.application.renderScreen("authorization");
    }
  });
}
