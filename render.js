import {
  clearLoginPassword,
  setLoginPassword,
  callPhone,
  receiveCall,
} from "./script.js";

//отрисовка кнопки завершения вызова
export function renderEndedButton(container) {
  const button = document.createElement("button");
  //button.textContent = "Завершить вызов";
  button.classList.add("phone__btn_ended");

  button.addEventListener("click", () => {
    // receiveCall();
    //console.log("phone");
  });
  container.appendChild(button);
}

//отрисовка блока при входящем звонке
export function renderIncomingCall(container) {
  const button = document.createElement("button");
  //button.textContent = "Ответить";
  button.classList.add("phone__btn_answer");

  button.addEventListener("click", () => {
    receiveCall();
    //console.log("phone");
  });
  container.appendChild(button);
}

//изменение статуса звонка
export function setMessage(message) {
  const messageSpan = document.querySelector(".messageSpan");
  messageSpan.textContent = message;
}

//отрисовка блока исходящего звонка
export function renderPhoneButton(container) {
  const button = document.createElement("button");
  button.textContent = "Позвонить";
  button.classList.add("phone__btn");

  button.addEventListener("click", () => {
    callPhone();
    //console.log("phone");
  });
  container.appendChild(button);
}

//отрисовка кнопки выхода
export function renderExitButton(container) {
  const button = document.createElement("button");
  //button.textContent = "Выйти";
  button.classList.add("exit__btn");
  // console.log("render_exit");
  button.addEventListener("click", () => {
    console.log("click_crear");
    clearLoginPassword();
    //const app = document.querySelector(".app");
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
  //const app = document.querySelector(".app");

  button.addEventListener("click", () => {
    const login = loginIn.value.trim();
    const password = passwordIn.value.trim();
    setLoginPassword(login, password);
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

  const listCallDiv = document.createElement("div");
  listCallDiv.classList.add("listCallDiv");
  phone.appendChild(listCallDiv);

  const listCallTitle = document.createElement("h3");
  listCallTitle.classList.add("listCallTitle");
  listCallTitle.textContent = "Список звонков";
  listCallDiv.appendChild(listCallTitle);

  const ButtonCallDiv = document.createElement("div");
  ButtonCallDiv.classList.add("ButtonCallDiv");
  phone.appendChild(ButtonCallDiv);

  const callDiv = document.createElement("div");
  callDiv.classList.add("callDiv");
  ButtonCallDiv.appendChild(callDiv);

  const callInput = document.createElement("input");
  callInput.classList.add("callInput");
  callDiv.appendChild(callInput);

  window.application.renderBlock("status-call", ButtonCallDiv);
  window.application.renderBlock("phone-button", callDiv);
  window.application.renderBlock("exit-button", ButtonCallDiv);
}
