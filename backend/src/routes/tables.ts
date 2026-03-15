import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminPinMiddleware } from '../middleware/adminPin';

export const tablesRouter = Router();

tablesRouter.get('/', async (req, res) => {
  const tables = await prisma.table.findMany({ orderBy: { name: 'asc' } });
  res.json(tables);
});

tablesRouter.post('/', adminPinMiddleware, async (req, res) => {
  const { name, x, y, width = 80, height = 80 } = req.body;
  const table = await prisma.table.create({ data: { name, x, y, width, height } });
  res.status(201).json(table);
});

tablesRouter.patch('/:id', adminPinMiddleware, async (req, res) => {
  const { id } = req.params;
  const table = await prisma.table.update({ where: { id }, data: req.body });
  res.json(table);
});

tablesRouter.delete('/:id', adminPinMiddleware, async (req, res) => {
  await prisma.table.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
