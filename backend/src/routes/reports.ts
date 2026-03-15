import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const reportsRouter = Router();

reportsRouter.get('/daily', async (req, res) => {
  const { date } = req.query;
  const start = date ? new Date(date as string) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const sessions = await prisma.tableSession.findMany({
    where: { closedAt: { gte: start, lt: end } },
    include: { orders: { include: { items: { include: { menuItem: true } } } } },
  });

  let totalRevenue = 0;
  const menuSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

  for (const session of sessions) {
    for (const order of session.orders) {
      for (const item of order.items) {
        totalRevenue += item.menuItem.price * item.quantity;
        if (!menuSales[item.menuItemId]) {
          menuSales[item.menuItemId] = { name: item.menuItem.name, quantity: 0, revenue: 0 };
        }
        menuSales[item.menuItemId].quantity += item.quantity;
        menuSales[item.menuItemId].revenue += item.menuItem.price * item.quantity;
      }
    }
  }

  res.json({
    date: start.toISOString().split('T')[0],
    totalRevenue,
    sessionCount: sessions.length,
    menuSales: Object.values(menuSales).sort((a, b) => b.quantity - a.quantity),
  });
});
