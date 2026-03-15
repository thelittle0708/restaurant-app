import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { tablesRouter } from './routes/tables';
import { sessionsRouter } from './routes/sessions';
import { reservationsRouter } from './routes/reservations';
import { menusRouter } from './routes/menus';
import { ordersRouter } from './routes/orders';
import { orderItemsRouter } from './routes/orderItems';
import { reportsRouter } from './routes/reports';
import { adminPinMiddleware } from './middleware/adminPin';
import { registerSocketEvents } from './socket';
import { setIo } from './lib/io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
setIo(io);

app.use(cors());
app.use(express.json());

app.use('/api/tables', tablesRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/order-items', orderItemsRouter);
app.use('/api/reports', adminPinMiddleware, reportsRouter);
app.get('/api/admin/ping', adminPinMiddleware, (req, res) => res.json({ ok: true }));

registerSocketEvents(io);

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export { app, httpServer };
