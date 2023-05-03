import Chat from './Chat';

//const chat = new Chat('ws://localhost:7070/ws');
const chat = new Chat('wss://ws-backend-hzzi.onrender.com/ws');
chat.init();
