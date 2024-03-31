import * as JsSIP from "jssip";
import {
  renderPhone,
  renderStatusCall,
  renderAuthorizationButton,
  renderExitButton,
  renderPhoneButton,
  setMessage,
  renderIncomingCall,
  renderEndedButton,
  renderAuthorizationScreen,
} from "./render.js";

window.application = {
  blocks: {},
  screens: {},
  renderScreen: function (screenName) {
    console.log(screenName);
    const app = document.querySelector(".app");
    app.textContent = "";
    const main = document.createElement("div");
    main.classList.add("main");
    app.appendChild(main);
    console.log(this.screens[screenName]);
    if (this.screens[screenName]) {
      this.screens[screenName](main);
    }
  },
  renderBlock: function (blockName, container) {
    console.log("block");
    console.log(blockName);
    this.blocks[blockName](container);
  },
};

window.application.screens["authorization"] = renderAuthorizationScreen;
window.application.screens["phone"] = renderPhone;
window.application.blocks["incoming-call"] = renderIncomingCall;
window.application.blocks["phone-button"] = renderPhoneButton;
window.application.blocks["exit-button"] = renderExitButton;
window.application.blocks["authorization-button"] = renderAuthorizationButton;
window.application.blocks["ended-button"] = renderEndedButton;
window.application.blocks["status-call"] = renderStatusCall;

renderFirstScreen();

const socket = new JsSIP.WebSocketInterface("wss:/voip.uiscom.ru");
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
export const coolPhone = new JsSIP.UA(configuration);

coolPhone.on("connected", function (e) {
  console.log("connected");
});

coolPhone.on("disconnected", function (e) {
  console.log("disconnected");
});

let session;
coolPhone.on("newRTCSession", function (data) {
  session = data.session;
  console.log(session);
  console.log(session.start_time);

  if (session.direction === "incoming") {
    const phone__btn_answer = document.querySelector(".phone__btn_answer");
    if (!phone__btn_answer) {
      const phone_conteiner = document.querySelector(".callDiv");
      window.application.renderBlock("incoming-call", phone_conteiner);
      window.application.renderBlock("ended-button", phone_conteiner);
    }

    session.on("accepted", () => {
      setMessage("accepted");
      console.log(session.start_time);
    });
    session.on("ended", () => {
      setMessage("ended");
      console.log(session.end_time);
    });

    session.on("progress", () => {
      setMessage("progress");
    });
    session.on("failed", (e) => {
      setMessage("failed");
      // console.log(e.cause);
    });
    session.on("connecting", () => {
      setMessage("connecting");
    });
    session.on("confirmed", () => {
      setMessage("confirmed");
    });
  }
});

coolPhone.start();

window.addEventListener("keydown", (e) => {
  if (e.key === "o") receiveCall();
});

export function receiveCall() {
  if (session) {
    session.answer();
  }
}

export function callPhone() {
  let options = {
    mediaConstraints: { audio: true, video: false },
    rtcOfferConstraints: {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 0,
    },
    pcConfig: {
      hackStripTcp: true,
      rtcpMuxPolicy: "negotiate",
      iceServers: [],
    },
  };

  const sessionCall = coolPhone.call("sip:0344301@voip.uiscom.ru", options);

  sessionCall.on("accepted", () => {
    setMessage("accepted");
  });
  sessionCall.on("ended", () => {
    setMessage("ended");
  });
  sessionCall.on("progress", () => {
    setMessage("progress");
  });
  sessionCall.on("failed", (e) => {
    setMessage("failed");
    //console.log(e.cause);
  });
  sessionCall.on("connecting", () => {
    setMessage("connecting");
  });
  sessionCall.on("confirmed", () => {
    setMessage("confirmed");
  });
}

export function setLoginPassword(log, pas) {
  chrome.storage.local.set({ login: "0344302" });
  chrome.storage.local.set({ password: "FYCpwA_3Bc" });
}

export function clearLoginPassword() {
  chrome.storage.local.clear();
  coolPhone.stop();
  window.close();
}

export function renderFirstScreen() {
  //const app = document.querySelector(".app");
  chrome.storage.local.get(["login"], (data) => {
    if (data.login) {
      window.application.renderScreen("phone");
    } else {
      window.application.renderScreen("authorization");
    }
  });
}
