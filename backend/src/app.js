"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const UserManager_1 = require("./managers/UserManager");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["https://linqo-azure.vercel.app/", "https://linqo-hrittiks-projects-9bda8799.vercel.app/", "https://linqo-git-main-hrittiks-projects-9bda8799.vercel.app/"],
        methods: ['GET','POST'],
        credentials: true
    }
});
const userManager = new UserManager_1.UserManager();

// const PORT = 'https://linqo-backend-ov2qwg49b-hrittiks-projects-9bda8799.vercel.app/';

const PORT = process.env.PORT;

const getSocketsInRoom = (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return [];
    
    const sockets = [];
    for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            sockets.push(socket);
        }
    }
    return sockets;
};


io.on('connection', (socket) => {
    console.log('a user connected');
    userManager.addUser("randomName", socket);
    socket.on("disconnect", () => {
        console.log("user disconnected");
        userManager.removeUser(socket.id);
    });

    socket.on('wallet-address', ({ roomId, address }) => {
        // Find the other user in the room
        const socketsInRoom = getSocketsInRoom(roomId);
        const otherSocket = socketsInRoom.find(s => s.id !== socket.id);
        
        if (otherSocket) {
          // Send wallet address to the other user
          otherSocket.emit('wallet-address', { address });
        }
    });

    socket.on('crypto-sent', ({ roomId, amount, signature }) => {
        const socketsInRoom = getSocketsInRoom(roomId);
        const otherSocket = socketsInRoom.find(s => s.id !== socket.id);
        if (otherSocket) {
          otherSocket.emit('crypto-received', { amount, signature });
        }
    });
});
server.listen(PORT, () => {
    console.log(`listening on port: ${PORT}`);
});
