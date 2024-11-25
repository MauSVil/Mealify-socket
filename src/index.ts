import express, { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { connectToDatabase } from './db';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, { cors: { origin: '*' }, pingInterval: 10000, pingTimeout: 5000 });

const usersLoggedIn: Record<string, string> = {};

io.on('connection', (socket) => {
  const { token, userId, role } = socket.handshake.auth;
  console.log('Un usuario se ha conectado', role, userId, socket.id);

  if (userId) usersLoggedIn[userId] = socket.id;

  socket.on('order-took', async ({ order, userId }) => {
    const db = await connectToDatabase();

    await db.collection('orders').updateOne({ _id: new ObjectId(order._id) }, { $set: { status: 'taken' } });
    await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { onHold: true } });

    io.to(usersLoggedIn[order.user]).emit('order-update', {
      ...order,
      status: 'taken',
    });
  });

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
    delete usersLoggedIn[userId];
  });
});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.post('/api/new-order', async (req: Request, res: Response) => {
  try {
    const { order } = req.body;
    const db = await connectToDatabase();
    const orderFound = await db.collection('orders').findOne({ _id: new ObjectId(order) });

    if (!orderFound) {
      res.status(404).json({ error: 'No se ha encontrado la orden' });
      return;
    }

    const restaurantFound = await db.collection('businesses').findOne({ _id: new ObjectId(orderFound.restaurant) });

    if (!restaurantFound) {
      res.status(404).json({ error: 'No se ha encontrado el restaurante' });
      return;
    }

    orderFound.restaurant = restaurantFound;

    const deliveryUsers = await db.collection('users').find({ role: 'delivery', active: true }).toArray();

    for (const user of deliveryUsers) {
      const { _id } = user;
      io.to(usersLoggedIn[_id.toString()]).emit('new-order', orderFound);
    }

    res.json({ data: 'Orden enviada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar la orden' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
