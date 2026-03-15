import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/lib/prisma';

let sessionId: string;
let menuItemId: string;

beforeEach(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();

  const table = await prisma.table.create({ data: { name: 'T1', x: 0, y: 0 } });
  const session = await prisma.tableSession.create({ data: { tableId: table.id, partySize: 2 } });
  sessionId = session.id;
  const category = await prisma.category.create({ data: { name: '메인', sortOrder: 0 } });
  const item = await prisma.menuItem.create({
    data: { name: '김치찌개', price: 9000, handledBy: 'KITCHEN', categoryId: category.id },
  });
  menuItemId = item.id;
});
afterAll(() => prisma.$disconnect());

describe('POST /api/orders', () => {
  it('creates order with items', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({ tableSessionId: sessionId, items: [{ menuItemId, quantity: 2 }] });
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].status).toBe('WAITING');
    expect(res.body.items[0].handledBy).toBe('KITCHEN');
  });
});
