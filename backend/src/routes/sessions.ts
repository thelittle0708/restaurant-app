import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { getIo } from '../lib/io';

export const sessionsRouter = Router();

sessionsRouter.get('/', async (req, res) => {
  const { tableId, active } = req.query;
  const where: Record<string, unknown> = {};
  if (tableId) where.tableId = tableId as string;
  if (active === 'true') where.closedAt = null;
  const sessions = await prisma.tableSession.findMany({ where });
  res.json(sessions);
});

sessionsRouter.post('/', async (req, res) => {
  const { tableId, partySize, phoneLastDigits, notes, reservationId } = req.body;
  const session = await prisma.tableSession.create({
    data: { tableId, partySize, phoneLastDigits, notes, reservationId },
  });
  await prisma.table.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } });
  if (reservationId) {
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'SEATED', tableId },
    });
  }
  getIo().emit('table:status', { tableId, status: 'OCCUPIED' });
  res.status(201).json(session);
});

sessionsRouter.post('/:id/close', async (req, res) => {
  const session = await prisma.tableSession.update({
    where: { id: req.params.id },
    data: { closedAt: new Date() },
  });
  await prisma.table.update({ where: { id: session.tableId }, data: { status: 'EMPTY' } });
  getIo().emit('table:status', { tableId: session.tableId, status: 'EMPTY' });
  getIo().emit('table:closed', { tableId: session.tableId, sessionId: session.id });
  res.json(session);
});
