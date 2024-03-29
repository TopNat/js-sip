import * as JsSIP from "jssip";
import {
  clearLoginPassword,
  setLoginPassword,
  renderFirstScreen,
} from "./app.js";

renderFirstScreen();

const socket = new JsSIP.WebSocketInterface("wss:/voip.uiscom.ru");
console.log(socket);
const configuration = {
  sockets: [socket],
  uri: "sip:0344302@voip.uiscom.ru",
  password: "FYCpwA_3Bc",
  sessionDescriptionHandlerFactoryOptions: {
    constraints: {
      audio: true,
      video: true,
    },
  },
};
const coolPhone = new JsSIP.UA(configuration);
console.log(coolPhone);

coolPhone.on("connected", function (e) {
  console.log("connected");
});

coolPhone.on("disconnected", function (e) {
  console.log(disconnected);
});
let session;
coolPhone.on("newRTCSession", function (data) {
  session = data.session;
  console.log("session");
  console.log(session);
  session.on("accepted", () => {
    console.log("accepted");
  });
  session.on("ended", () => {
    console.log("ended");
  });
});

coolPhone.start();
window.addEventListener("keydown", (e) => {
  if (e.key === "o") receiveCall();
});

function receiveCall() {
  console.log("receiveCall");
  if (session) {
    console.log(session.direction);
    session.answer();
  }
}

function callPhone() {
  console.log("callPhone");

  let eventHandlers = {
    progress: function (e) {
      console.log("call is in progress");
    },
    failed: function (e) {
      console.log("call failed with cause: " + e.data.cause);
    },
    ended: function (e) {
      console.log("call ended with cause: " + e.data.cause);
    },
    confirmed: function (e) {
      console.log("call confirmed");
    },
  };

  let options = {
    eventHandlers: eventHandlers,
    mediaConstraints: { audio: true, video: false },
    rtcOfferConstraints: {
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    },
    pcConfig: {
      iceServers: [
        { urls: ["stun:a.example.com", "stun:b.example.com"] },
        { urls: "turn:example.com", username: "foo", credential: " 1234" },
      ],
    },
  };

  coolPhone.call("sip:0344301@voip.uiscom.ru", options);

  //coolPhone.call();
  // coolPhone.call("0344301");
  // //const testCall = session.call("0344301");
  // session.on("accepted", () => {
  //   console.log("testCallaccepted");
  // });
  // session.on("ended", () => {
  //   console.log("testCallended");
  // });
}

window.application = {
  blocks: {},
  screens: {},
  renderScreen: function (screenName) {
    const app = document.querySelector(".app");
    app.textContent = "";
    const main = document.createElement("div");
    main.classList.add("main");
    app.appendChild(main);
    if (this.screens[screenName]) {
      this.screens[screenName](main);
    }
  },
  renderBlock: function (blockName, container) {
    this.blocks[blockName](container);
  },
  /*
  timers: [],
  token: '',
  listPlayers: [],
  rival: ''*/
  //login: "",
  //password: "",
};

function renderPhoneButton(container) {
  const button = document.createElement("button");
  button.textContent = "Позвонить";
  button.classList.add("phone__btn");

  button.addEventListener("click", () => {
    callPhone();
    //console.log("phone");
  });
  container.appendChild(button);
}
window.application.blocks["phone-button"] = renderPhoneButton;

function renderExitButton(container) {
  const button = document.createElement("button");
  button.textContent = "Выйти";
  button.classList.add("exit__btn");
  // console.log("render_exit");
  button.addEventListener("click", () => {
    console.log("click_crear");
    clearLoginPassword();
    window.application.renderScreen("authorization");
  });
  container.appendChild(button);
}
window.application.blocks["exit-button"] = renderExitButton;

function renderAuthorizationButton(container) {
  const button = document.createElement("button");
  button.textContent = "Войти";
  button.classList.add("authorization__btn");
  const loginIn = document.querySelector(".authorization__login");
  const passwordIn = document.querySelector(".authorization__password");

  button.addEventListener("click", () => {
    const login = loginIn.value.trim();
    const password = passwordIn.value.trim();
    setLoginPassword(login, password);
    window.application.renderScreen("phone");
  });
  container.appendChild(button);
}

window.application.blocks["authorization-button"] = renderAuthorizationButton;

/////////
function renderAuthorizationScreen(container) {
  const formAuto = document.createElement("div");
  formAuto.classList.add("authorization");
  container.appendChild(formAuto);

  const login = document.createElement("input");
  login.type = "text";
  login.placeholder = "Логин";
  login.classList.add("authorization__login");
  formAuto.appendChild(login);
  const password = document.createElement("input");
  password.type = "text";
  password.placeholder = "Пароль";
  password.classList.add("authorization__password");
  formAuto.appendChild(password);

  window.application.renderBlock("authorization-button", formAuto);
}

window.application.screens["authorization"] = renderAuthorizationScreen;

function renderPhone(container) {
  const phone = document.createElement("div");
  phone.classList.add("phone");
  container.appendChild(phone);
  window.application.renderBlock("phone-button", phone);
  window.application.renderBlock("exit-button", phone);
}
window.application.screens["phone"] = renderPhone;

/////
