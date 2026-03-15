import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { syncTableStatus } from '../socket/tableStatusSync';
import { getIo } from '../lib/io';

export const orderItemsRouter = Router();

orderItemsRouter.patch('/:id/status', async (req, res) => {
  const { status } = req.body as { status: 'WAITING' | 'COOKING' | 'DONE' };
  const item = await prisma.orderItem.update({
    where: { id: req.params.id },
    data: { status },
    include: { order: { include: { tableSession: true } } },
  });
  const tableId = item.order.tableSession.tableId;
  await syncTableStatus(tableId);
  getIo().emit('order:item_status', { itemId: item.id, status });
  res.json(item);
});
