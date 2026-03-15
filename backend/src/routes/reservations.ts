import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const reservationsRouter = Router();

reservationsRouter.get('/', async (req, res) => {
  const { date } = req.query;
  const start = date ? new Date(date as string) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const reservations = await prisma.reservation.findMany({
    where: { reservedAt: { gte: start, lt: end }, status: 'PENDING' },
    orderBy: { reservedAt: 'asc' },
  });
  res.json(reservations);
});

reservationsRouter.post('/', async (req, res) => {
  const reservation = await prisma.reservation.create({ data: req.body });
  res.status(201).json(reservation);
});

reservationsRouter.patch('/:id', async (req, res) => {
  const reservation = await prisma.reservation.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(reservation);
});

reservationsRouter.delete('/:id', async (req, res) => {
  await prisma.reservation.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });
  res.status(204).send();
});
