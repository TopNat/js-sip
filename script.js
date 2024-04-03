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
    //console.log(screenName);
    const app = document.querySelector(".app");
    app.textContent = "";
    const main = document.createElement("div");
    main.classList.add("main");
    app.appendChild(main);
    //console.log(this.screens[screenName]);
    if (this.screens[screenName]) {
      this.screens[screenName](main);
    }
  },
  renderBlock: function (blockName, container) {
    //console.log("block");
    //console.log(blockName);
    this.blocks[blockName](container);
  },
};

window.application.screens["authorization"] = renderAuthorizationScreen;
window.application.screens["phone"] = renderPhone;
//window.application.blocks["incoming-call"] = renderIncomingCall;
window.application.blocks["phone-button"] = renderPhoneButton;
window.application.blocks["exit-button"] = renderExitButton;
window.application.blocks["authorization-button"] = renderAuthorizationButton;
window.application.blocks["ended-button"] = renderEndedButton;
window.application.blocks["status-call"] = renderStatusCall;
window.application.blocks["button-footer"] = renderBlockButton;
window.application.blocks["call_info"] = getCallInfo;

renderFirstScreen();

export function createUA() {
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
  const coolPhone = new JsSIP.UA(configuration);

  coolPhone.on("connected", function (e) {
    console.log("connected");
  });

  coolPhone.on("disconnected", function (e) {
    console.log("disconnected");
  });

  let session;

  coolPhone.on("newRTCSession", function (data) {
    session = data.session;

    if (session.direction === "incoming") {
      let audio = new Audio("./call/call.mp3");
      //audio.loop;
      audio.play();

      session.on("accepted", () => {
        setMessage("accepted");
        //console.log(session.start_time);
      });
      session.on("ended", () => {
        setMessage("ended");
        //console.log(session.end_time);
      });
      session.on("progress", () => {
        setMessage("progress");
      });
      session.on("failed", (e) => {
        setMessage("failed");
      });
      session.on("connecting", () => {
        setMessage("connecting");

        /////////////////////////////
        let peerconnection = session.connection;
        let localStream = peerconnection.getLocalStreams()[0];
        console.log(peerconnection);
        console.log(localStream);
        // Handle local stream
        if (localStream) {
          // Clone local stream
          const localClonedStream = localStream.clone();

          console.log("UA set local stream");

          let localAudioControl = document.getElementById("localAudio");
          localAudioControl.src = localClonedStream;
        }
        localAudioControl.play();
        // Как только астер отдаст нам поток абонента, мы его засунем к себе в наушники
        /* session.addEventListener("IncomingRequest", (event) => {
          console.log("UA session addstream");
  
          // let remoteAudioControl = document.getElementById("remoteAudio");
          // remoteAudioControl.srcObject = event.stream;
        });*/
        /////////////////////////////
      });
      session.on("confirmed", () => {
        setMessage("confirmed");
      });
      const timeCall = formatDate(new Date());
      setCallInfo(session.local_identity.uri.user, timeCall);
    }
  });

  coolPhone.start();

  greenButton(session, coolPhone);
  const redBtn = document.querySelector(".phone__btn_ended");

  redBtn.addEventListener("click", () => {
    redButton(session);
  });

  // return { coolPhone, session };
}

export function greenButton(session, coolPhone) {
  const numberCall = document.querySelector(".callInput");
  const greenBtn = document.querySelector(".phone__btn_answer");

  greenBtn.addEventListener("click", () => {
    console.log("greenbtnClick");
    if (session) {
      if (
        session.direction === "incoming" &&
        !session.end_time &&
        session.isInProgress()
      ) {
        console.log("ответить");
        receiveCall();
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
  });

  //console.log(session.direction);
  // console.log(session.isInProgress());
  // console.log(session.end_time);
}

export function redButton(session) {
  console.log(session);
  //const redBtn = document.querySelector(".phone__btn_ended");

  //redBtn.addEventListener("click", () => {
  if (session.isInProgress() || session.isEstablished()) {
    session.terminate();
  }
  // });
}

window.addEventListener("keydown", (e) => {
  if (e.key === "o") receiveCall();
});

export function receiveCall() {
  if (session) {
    console.log("answer");
    session.answer();
  }
}

export function callPhone(coolPhone) {
  let options = {
    mediaConstraints: { audio: true, video: false },
    // rtcOfferConstraints: {
    //   offerToReceiveAudio: 1,
    //   offerToReceiveVideo: 0,
    // },
    // pcConfig: {
    //   hackStripTcp: true,
    //   rtcpMuxPolicy: "negotiate",
    //   iceServers: [],
    // },
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
  console.log(coolPhone);
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
  const timeCall = formatDate(new Date());

  setCallInfo(numberCall.value.trim(), timeCall);
}

export function setLoginPassword(log, pas, ser) {
  chrome.storage.local.set({ login: "0344302" });
  chrome.storage.local.set({ password: "FYCpwA_3Bc" });
  chrome.storage.local.set({ server: "voip.uiscom.ru" });
}

export function clearLoginPassword() {
  chrome.storage.local.clear();
  coolPhone.stop();
  window.close();
}

export function selectNumber(number) {
  const callInput = document.querySelector(".callInput");
  callInput.value = number;
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

export function formatDate(date) {
  console.log(date);

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

  //return dd + '.' + mm + '.' + yy;
  return HH + "." + min + "." + sec;
}
