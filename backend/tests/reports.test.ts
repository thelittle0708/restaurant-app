import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
});
afterAll(() => prisma.$disconnect());

it('returns daily revenue for closed sessions', async () => {
  const table = await prisma.table.create({ data: { name: 'T1', x: 0, y: 0 } });
  const session = await prisma.tableSession.create({
    data: { tableId: table.id, partySize: 2, closedAt: new Date() },
  });
  const cat = await prisma.category.create({ data: { name: '메인', sortOrder: 0 } });
  const menu = await prisma.menuItem.create({
    data: { name: '김치찌개', price: 9000, handledBy: 'KITCHEN', categoryId: cat.id },
  });
  const order = await prisma.order.create({ data: { tableSessionId: session.id } });
  await prisma.orderItem.create({
    data: { orderId: order.id, menuItemId: menu.id, quantity: 2, handledBy: 'KITCHEN', status: 'DONE' },
  });
  const today = new Date().toISOString().split('T')[0];
  const res = await request(app)
    .get(`/api/reports/daily?date=${today}`)
    .set('x-admin-pin', process.env.ADMIN_PIN || '0000');
  expect(res.status).toBe(200);
  expect(res.body.totalRevenue).toBe(18000);
  expect(res.body.sessionCount).toBe(1);
  expect(res.body.menuSales[0].name).toBe('김치찌개');
});

it('excludes open sessions', async () => {
  const table = await prisma.table.create({ data: { name: 'T2', x: 0, y: 0 } });
  await prisma.tableSession.create({ data: { tableId: table.id, partySize: 2 } });
  const today = new Date().toISOString().split('T')[0];
  const res = await request(app)
    .get(`/api/reports/daily?date=${today}`)
    .set('x-admin-pin', process.env.ADMIN_PIN || '0000');
  expect(res.body.sessionCount).toBe(0);
  expect(res.body.totalRevenue).toBe(0);
});
