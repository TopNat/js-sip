import {
  clearLoginPassword,
  setLoginPassword,
  callPhone,
  receiveCall,
  greenButton,
  redButton,
  selectNumber,
  createUA,
} from "./script.js";

//информация о звонке
export function setCallInfo(user, time) {
  const listCall = chrome.storage.local.get({ callInfo: [] }, (data) => {
    let listCallInfo = data.callInfo.slice(-9);
    listCallInfo.push({ user, time });
    chrome.storage.local.set({ callInfo: listCallInfo });
  });
  console.log(user);
  const listCallDiv = document.querySelector(".listCallDiv");
  window.application.renderBlock("call_info", listCallDiv);
}

//выводим историю звонков
export function getCallInfo() {
  console.log("getCallInfo");
  const listCall = chrome.storage.local.get({ callInfo: [] }, (data) => {
    //console.log(data.callInfo);
    const listCallDivItem = document.querySelector(".listCallDivItem");
    listCallDivItem.textContent = "";
    const calls = data.callInfo.reverse();
    calls.map((item) => {
      const divCall = document.createElement("div");
      divCall.classList.add("divCallItem");
      listCallDivItem.appendChild(divCall);
      divCall.addEventListener("click", () => selectNumber(item.user));

      const divUserCall = document.createElement("divUser");
      divUserCall.textContent = item.user;
      divCall.appendChild(divUserCall);

      const divTimeCall = document.createElement("divTime");
      divTimeCall.textContent = item.time;
      divCall.appendChild(divTimeCall);
      console.log("render" + item);
    });
  });
}

//красная кнопка
export function renderEndedButton(container) {
  const button = document.createElement("button");
  button.classList.add("phone__btn_ended");

  //   button.addEventListener("click", () => {
  //     redButton();
  //   });
  container.appendChild(button);
}

//зеленая кнопка
export function renderPhoneButton(container) {
  const button = document.createElement("button");
  button.classList.add("phone__btn_answer");
  //button.setAttribute("disabled", "true");

  //   button.addEventListener("click", () => {
  //     greenButton();
  //   });
  container.appendChild(button);
}

//отрисовка нижнего блока кнопок
export function renderBlockButton(container) {
  const divFooter = document.createElement("div");
  divFooter.classList.add("div_footer_button");
  container.appendChild(divFooter);

  window.application.renderBlock("phone-button", divFooter);
  window.application.renderBlock("ended-button", divFooter);
  window.application.renderBlock("exit-button", divFooter);
}

//изменение статуса звонка
export function setMessage(message) {
  const messageSpan = document.querySelector(".messageSpan");
  messageSpan.textContent = message;
}

//отрисовка кнопки выхода
export function renderExitButton(container) {
  const button = document.createElement("button");
  button.classList.add("exit__btn");

  button.addEventListener("click", () => {
    console.log("click_crear");
    clearLoginPassword();
    window.application.renderScreen("authorization");
  });
  container.appendChild(button);
}

//отрисовка кнопки авторизации
export function renderAuthorizationButton(container) {
  const button = document.createElement("button");
  button.textContent = "Войти";
  button.classList.add("authorization__btn");

  const loginIn = document.querySelector(".authorization__login");
  const passwordIn = document.querySelector(".authorization__password");
  const serverIn = document.querySelector(".authorization__server");

  button.addEventListener("click", () => {
    const login = loginIn.value.trim();
    const password = passwordIn.value.trim();
    const server = serverIn.value.trim();

    setLoginPassword(login, password, server);
    window.application.renderScreen("phone");
  });
  container.appendChild(button);
}

//отрисовка окна авторизации
export function renderAuthorizationScreen(container) {
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

  const server = document.createElement("input");
  server.type = "text";
  server.placeholder = "Сервер";
  server.classList.add("authorization__server");
  formAuto.appendChild(server);

  window.application.renderBlock("authorization-button", formAuto);
}

//отрисовка блока статуса звонка
export function renderStatusCall(container) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("messageDiv");
  container.appendChild(messageDiv);

  const messageSpanLabel = document.createElement("span");
  messageSpanLabel.classList.add("messageSpanLabel");
  messageSpanLabel.textContent = "Статус звонка: ";
  messageDiv.appendChild(messageSpanLabel);

  const messageSpan = document.createElement("span");
  messageSpan.classList.add("messageSpan");
  messageSpan.textContent = "";
  messageDiv.appendChild(messageSpan);
}

//отрисовка блока основного экрана
export function renderPhone(container) {
  const phone = document.createElement("div");
  phone.classList.add("phone");
  container.appendChild(phone);

  const localAudio = document.createElement("audio");
  localAudio.classList.add("localAudio");
  localAudio.setAttribute("autoPlay", true);
  localAudio.setAttribute("muted", true);
  container.appendChild(localAudio);


  const remoteAudio = document.createElement("audio");
  remoteAudio.classList.add("remoteAudio");
  remoteAudio.setAttribute("autoPlay", true);
  remoteAudio.setAttribute("muted", true);
  container.appendChild(remoteAudio);

  const listCallDiv = document.createElement("div");
  listCallDiv.classList.add("listCallDiv");
  phone.appendChild(listCallDiv);

  const listCallTitle = document.createElement("h3");
  listCallTitle.classList.add("listCallTitle");
  listCallTitle.textContent = "Список звонков";
  listCallDiv.appendChild(listCallTitle);

  const listCallDivItem = document.createElement("div");
  listCallDivItem.classList.add("listCallDivItem");
  listCallDiv.appendChild(listCallDivItem);

  //getCallInfo();
  // const listCallDivItem = document.querySelector(".listCallDivItem");
  //listCallDivItem.textContent = "";
  window.application.renderBlock("call_info", listCallDiv);

  const ButtonCallDiv = document.createElement("div");
  ButtonCallDiv.classList.add("ButtonCallDiv");
  phone.appendChild(ButtonCallDiv);

  const callDiv = document.createElement("div");
  callDiv.classList.add("callDiv");
  ButtonCallDiv.appendChild(callDiv);

  const callInputLabel = document.createElement("span");
  callInputLabel.textContent = "Номер";
  callDiv.appendChild(callInputLabel);

  const callInput = document.createElement("input");
  callInput.classList.add("callInput");
  callDiv.appendChild(callInput);
  /*
  callInput.addEventListener("click", () => {
    const btn = document.querySelector(".phone__btn_answer");
    btn.setAttribute("disabled", "false");

    console.log("click");
  });*/

  window.application.renderBlock("status-call", ButtonCallDiv);
  window.application.renderBlock("button-footer", ButtonCallDiv);
  createUA();
}
