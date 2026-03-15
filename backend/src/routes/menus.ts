import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { adminPinMiddleware } from '../middleware/adminPin';

export const menusRouter = Router();

menusRouter.get('/categories', async (req, res) => {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { items: { orderBy: { name: 'asc' } } },
  });
  res.json(cats);
});

menusRouter.post('/categories', adminPinMiddleware, async (req, res) => {
  const cat = await prisma.category.create({ data: req.body });
  res.status(201).json(cat);
});

menusRouter.patch('/categories/:id', adminPinMiddleware, async (req, res) => {
  const cat = await prisma.category.update({ where: { id: req.params.id }, data: req.body });
  res.json(cat);
});

menusRouter.delete('/categories/:id', adminPinMiddleware, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

menusRouter.get('/', async (req, res) => {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: { name: 'asc' },
  });
  res.json(items);
});

menusRouter.post('/', adminPinMiddleware, async (req, res) => {
  const item = await prisma.menuItem.create({ data: req.body, include: { category: true } });
  res.status(201).json(item);
});

menusRouter.patch('/:id', adminPinMiddleware, async (req, res) => {
  const item = await prisma.menuItem.update({
    where: { id: req.params.id },
    data: req.body,
    include: { category: true },
  });
  res.json(item);
});

menusRouter.delete('/:id', adminPinMiddleware, async (req, res) => {
  await prisma.menuItem.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
