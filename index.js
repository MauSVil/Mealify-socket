"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = require("./db");
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const io = new socket_io_1.Server(server, { cors: { origin: '*' }, pingInterval: 10000, pingTimeout: 5000 });
const usersLoggedIn = {};
io.on('connection', (socket) => {
    const { token, userId } = socket.handshake.auth;
    console.log('Un usuario se ha conectado', token, userId, socket.id);
    if (userId)
        usersLoggedIn[userId] = socket.id;
    socket.on('disconnect', () => {
        console.log('Un usuario se ha desconectado');
        delete usersLoggedIn[userId];
    });
});
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.post('/api/new-order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { order } = req.body;
        const db = yield (0, db_1.connectToDatabase)();
        const orderFound = yield db.collection('orders').findOne({ _id: new mongodb_1.ObjectId(order) });
        if (!orderFound) {
            res.status(404).json({ error: 'No se ha encontrado la orden' });
            return;
        }
        const deliveryUsers = yield db.collection('users').find({ role: 'delivery', active: true }).toArray();
        for (const user of deliveryUsers) {
            const { _id } = user;
            io.to(usersLoggedIn[_id.toString()]).emit('new-order', orderFound);
        }
        res.json({ data: 'Orden enviada' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al enviar la orden' });
    }
}));
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
