/* eslint-disable no-console */
/* eslint-disable no-alert */
/* eslint-disable class-methods-use-this */
export default class Chat {
  constructor(url) {
    this.container = document.querySelector('body');
    this.url = url;
    this.users = [];
    this.yourUser = null;
    this.ws = new WebSocket(this.url);
  }

  init() {
    this.formAutorization();
    this.ws.addEventListener('open', () => {
      console.log('connected');
    });
    this.ws.addEventListener('message', (evt) => {
      const message = JSON.parse(evt.data);
      if (message.type === 'error') {
        alert('Данный псевдоним занят. Выберите другой, пожалуйста.');
      } else if (message.type === 'autorized' || message.type === 'users') {
        this.users = message.data;
        this.container.removeChild(this.container.firstChild);
        this.showChat();
      } else if (message.type === 'postMessage') {
        this.showMessage(message.data);
      }
    });
    this.ws.addEventListener('close', (evt) => {
      console.log('connection closed', evt);
    });
    this.ws.addEventListener('error', () => {
      console.log('error');
    });
    window.addEventListener('beforeunload', () => {
      this.ws.send(JSON.stringify({ type: 'deleteUser', user: this.yourUser }));
    });
  }

  formAutorization() {
    const form = document.createElement('form');
    form.classList.add('autorization');
    form.innerHTML = `<h4>Выберите псевдоним</h4>
      <input class="input" type="text" required>
      <button type="submit" class="btn">Продолжить</button>`;
    this.container.insertAdjacentElement('afterbegin', form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.yourUser = form.querySelector('input').value;
      const message = { type: 'autorization', name: this.yourUser };
      this.ws.send(JSON.stringify(message));
    });
  }

  showChat() {
    const formChat = document.createElement('form');
    formChat.classList.add('form-chat');
    formChat.innerHTML = `<div class="users"></div>
      <div class="chat">
        <div class="form-message"></div>
        <input class="input-chat" type="text" placeholder="Type your message here" required>
      </div>`;
    this.container.insertAdjacentElement('afterbegin', formChat);
    const formUsers = formChat.querySelector('.users');
    this.users.forEach((user) => {
      const userForm = document.createElement('li');
      userForm.classList.add('user');
      userForm.textContent = user.name;
      if (user.name === this.yourUser) {
        userForm.textContent = 'You';
      }
      formUsers.insertAdjacentElement('beforeend', userForm);
    });
    const chat = formChat.querySelector('.input-chat');
    formChat.addEventListener('submit', (e) => {
      e.preventDefault();
      const context = chat.value;
      const time = this.dateToString();
      const message = {
        type: 'postMessage',
        data: {
          name: this.yourUser,
          context,
          time,
        },
      };
      this.ws.send(JSON.stringify(message));
      chat.value = '';
    });
  }

  dateToString() {
    const date = new Date();
    const result = date.toLocaleString('ru-Ru', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return result.replace(/[,%]/g, '');
  }

  showMessage(data) {
    const message = document.createElement('div');
    message.classList.add('message');
    const { name, time, context } = data.data;
    message.innerHTML = `
      <div class="data-user">
        <span class="user-name">${name}</span>
        <span>${time}</span>
      </div>
      <p class="text">${context}</p>`;
    if (name === this.yourUser) {
      message.querySelector('.user-name').textContent = 'You';
      message.classList.add('message-right');
    } else {
      message.classList.add('message-left');
    }
    this.container.querySelector('.form-message').appendChild(message);
  }
}
