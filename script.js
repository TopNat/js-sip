import * as JsSIP from "jssip";
import {
  renderPhone,
  renderStatusCall,
  renderAuthorizationButton,
  renderExitButton,
  renderPhoneButton,
  setMessage,
  renderEndedButton,
  renderAuthorizationScreen,
  renderBlockButton,
  setCallInfo,
  getCallInfo,
} from "./render.js";

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
};

window.application.screens["authorization"] = renderAuthorizationScreen;
window.application.screens["phone"] = renderPhone;
window.application.blocks["phone-button"] = renderPhoneButton;
window.application.blocks["exit-button"] = renderExitButton;
window.application.blocks["authorization-button"] = renderAuthorizationButton;
window.application.blocks["ended-button"] = renderEndedButton;
window.application.blocks["status-call"] = renderStatusCall;
window.application.blocks["button-footer"] = renderBlockButton;
window.application.blocks["call_info"] = getCallInfo;

renderFirstScreen();

export function createUA() {
  chrome.storage.local.get(["login", "password", "server"], (data) => {
    if (data.login && data.password && data.server) {
      const socket = new JsSIP.WebSocketInterface("wss:/" + data.server);
      const configuration = {
        sockets: [socket],
        uri: "sip:" + data.login + "@" + data.server,
        password: data.password,
        sessionDescriptionHandlerFactoryOptions: {
          constraints: {
            audio: true,
            video: true,
          },
        },
      };
      const coolPhone = new JsSIP.UA(configuration);

      coolPhone.on("connected", function (e) {});

      coolPhone.on("disconnected", function (e) {
        coolPhone.stop();
        window.application.renderScreen("authorization");
        let messageError = document.querySelector(".messageError");
        messageError.textContent = "Введены неверные данные!";
      });

      let session;

      coolPhone.on("newRTCSession", function (data) {
        session = data.session;
        if (session.direction === "incoming") {
          let interval;
          let seconds = 0;
          const messageTimeSpan = document.querySelector(".messageTimeSpan");
          let audio = new Audio("./call/call.mp3");
          audio.play();

          session.on("accepted", () => {
            setMessage("accepted");
          });
          session.on("ended", () => {
            setMessage("ended");
            clearInterval(interval);
            messageTimeSpan.textContent = "";
          });
          session.on("progress", () => {
            setMessage("progress");
          });

          session.on("failed", (e) => {
            setMessage("failed");
          });
          session.on("connecting", () => {
            setMessage("connecting");
          });

          session.on("peerconnection", () => {
            let peerconnection = session.connection;

            let localStream = peerconnection.getLocalStreams()[0];
            if (localStream) {
              const localClonedStream = localStream.clone();
              let localAudioControl = document.querySelector(".localAudio");
              localAudioControl.srcObject = localClonedStream;
            }
            peerconnection.onaddstream = (event) => {
              let remoteAudioControl = document.querySelector(".remoteAudio");
              remoteAudioControl.srcObject = event.stream;
            };
          });
          session.on("confirmed", () => {
            setMessage("confirmed");
            interval = setInterval(() => {
              seconds++;
              messageTimeSpan.textContent = setTime(seconds);
            }, 1000);
          });
          const timeCall = formatDate(new Date());
          setCallInfo(session.remote_identity.uri.user, timeCall);
        }
      });

      coolPhone.start();

      const redBtn = document.querySelector(".phone__btn_ended");

      redBtn.addEventListener("click", () => {
        redButton(session);
      });

      const greenBtn = document.querySelector(".phone__btn_answer");

      greenBtn.addEventListener("click", () => {
        greenButton(session, coolPhone);
      });

      const exitBtn = document.querySelector(".exit__btn");
      exitBtn.addEventListener("click", () => {
        clearLoginPassword(coolPhone);
        window.application.renderScreen("authorization");
      });
    }
  });
}

export function greenButton(session, coolPhone) {
  const numberCall = document.querySelector(".callInput");
  if (numberCall.value.trim() === "") {
    setMessage("Введите номер");
  }

  if (session) {
    if (
      session.direction === "incoming" &&
      !session.end_time &&
      session.isInProgress()
    ) {
      receiveCall(session);
    } else {
      if (numberCall.value) {
        callPhone(coolPhone);
      }
    }
  } else {
    if (numberCall.value) {
      callPhone(coolPhone);
    }
  }
  numberCall.value = "";
}

export function redButton(session) {
  if (session) {
    if (session.isInProgress() || session.isEstablished()) {
      session.terminate();
    }
    let localAudio = document.querySelector(".localAudio");
    localAudio.pause();
    let remoteAudio = document.querySelector(".remoteAudio");
    remoteAudio.pause();
  }
}

window.addEventListener("keydown", (e) => {
  if (e.key === "o") receiveCall();
});

export function receiveCall(session) {
  if (session) {
    session.answer();
  }
}

export function callPhone(coolPhone) {
  let interval;
  let seconds = 0;
  const messageTimeSpan = document.querySelector(".messageTimeSpan");
  let options = {
    mediaConstraints: { audio: true, video: false },
  };
  const numberCall = document.querySelector(".callInput");

  let server;

  chrome.storage.local.get(["server"], (data) => {
    server = data.server;
  });

  const sessionCall = coolPhone.call(
    "sip:" + numberCall.value.trim() + server,
    options
  );

  sessionCall.on("accepted", () => {
    setMessage("accepted");
  });
  sessionCall.on("ended", () => {
    setMessage("ended");
    clearInterval(interval);
    messageTimeSpan.textContent = "";
    let localAudio = document.querySelector(".localAudio");
    localAudio.pause();
    let remoteAudio = document.querySelector(".remoteAudio");
    remoteAudio.pause();
  });
  sessionCall.on("progress", () => {
    setMessage("progress");
  });
  sessionCall.on("failed", (e) => {
    setMessage("failed");
  });
  sessionCall.on("connecting", () => {
    setMessage("connecting");
  });
  sessionCall.on("confirmed", () => {
    setMessage("confirmed");
    interval = setInterval(() => {
      seconds++;
      messageTimeSpan.textContent = setTime(seconds);
    }, 1000);
    let peerconnection = sessionCall.connection;
    let localStream = peerconnection.getLocalStreams()[0];
    let remoteStream = peerconnection.getRemoteStreams()[0];

    if (localStream) {
      const localClonedStream = localStream.clone();
      let localAudioControl = document.querySelector(".localAudio");
      localAudioControl.srcObject = localClonedStream;
    }
    if (remoteStream) {
      const localClonedStreamRemote = remoteStream.clone();
      let remoteAudioControl = document.querySelector(".remoteAudio");
      remoteAudioControl.srcObject = localClonedStreamRemote;
    }
  });

  const timeCall = formatDate(new Date());

  setCallInfo(numberCall.value.trim(), timeCall);
}

export function setLoginPassword(log, pas, ser) {
  chrome.storage.local.set({ login: log });
  chrome.storage.local.set({ password: pas });
  chrome.storage.local.set({ server: ser });
}

export function clearLoginPassword(coolPhone) {
  chrome.storage.local.clear();
  coolPhone.stop();
  window.close();
}

export function selectNumber(number) {
  const callInput = document.querySelector(".callInput");
  callInput.value = number;
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

export function formatDate(date) {
  let dd = date.getDate();

  if (dd < 10) dd = "0" + dd;

  let mm = date.getMonth() + 1;
  if (mm < 10) mm = "0" + mm;

  let yy = date.getFullYear() % 100;
  if (yy < 10) yy = "0" + yy;

  let HH = date.getHours();
  if (HH < 10) HH = "0" + HH;

  let min = date.getMinutes();
  if (min < 10) min = "0" + min;

  let sec = date.getSeconds();
  if (sec < 10) sec = "0" + sec;

  return HH + ":" + min + ":" + sec;
}

function setTime(seconds) {
  let hours = Math.floor(seconds / 60 / 60);

  let minutes = Math.floor(seconds / 60) - hours * 60;

  let sec = seconds % 60;

  return hours + ":" + minutes + ":" + sec;
}
