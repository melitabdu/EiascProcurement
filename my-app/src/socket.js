// src/socket.js
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your actual backend address

socket.on('connect', () => {
  console.log('✅ Connected with ID:', socket.id);
})


export default socket; // ✅ Important!
