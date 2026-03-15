import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/lib/prisma';

let itemId: string;
let tableId: string;

beforeEach(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  const table = await prisma.table.create({ data: { name: 'T1', x: 0, y: 0, status: 'OCCUPIED' } });
  tableId = table.id;
  const session = await prisma.tableSession.create({ data: { tableId, partySize: 2 } });
  const cat = await prisma.category.create({ data: { name: '메인', sortOrder: 0 } });
  const menu = await prisma.menuItem.create({
    data: { name: '김치찌개', price: 9000, handledBy: 'KITCHEN', categoryId: cat.id },
  });
  const order = await prisma.order.create({ data: { tableSessionId: session.id } });
  const item = await prisma.orderItem.create({
    data: { orderId: order.id, menuItemId: menu.id, quantity: 1, handledBy: 'KITCHEN', status: 'WAITING' },
  });
  itemId = item.id;
});
afterAll(() => prisma.$disconnect());

it('updates orderItem status to COOKING', async () => {
  const res = await request(app)
    .patch(`/api/order-items/${itemId}/status`)
    .send({ status: 'COOKING' });
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('COOKING');
});

it('sets table to PICKUP_READY when item is set to DONE', async () => {
  await request(app).patch(`/api/order-items/${itemId}/status`).send({ status: 'DONE' });
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  expect(table?.status).toBe('PICKUP_READY');
});
