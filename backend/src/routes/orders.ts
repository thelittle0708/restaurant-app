import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getIo } from '../lib/io';

export const ordersRouter = Router();

ordersRouter.get('/session/:sessionId', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { tableSessionId: req.params.sessionId },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(orders);
});

ordersRouter.post('/', async (req, res) => {
  const { tableSessionId, items } = req.body as {
    tableSessionId: string;
    items: { menuItemId: string; quantity: number }[];
  };
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
  });
  const handledByMap = Object.fromEntries(menuItems.map((m) => [m.id, m.handledBy]));
  const order = await prisma.order.create({
    data: {
      tableSessionId,
      items: {
        create: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          handledBy: handledByMap[item.menuItemId],
        })),
      },
    },
    include: { items: { include: { menuItem: true } } },
  });
  const session = await prisma.tableSession.findUnique({
    where: { id: tableSessionId },
    select: { tableId: true },
  });
  getIo().emit('order:new', { tableId: session?.tableId, order });
  res.status(201).json(order);
});
