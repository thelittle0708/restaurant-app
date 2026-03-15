jest.mock('../src/lib/io', () => ({
  getIo: () => ({ emit: jest.fn() }),
}));

import { prisma } from '../src/lib/prisma';
import { syncTableStatus } from '../src/socket/tableStatusSync';

let tableId: string;
let orderId: string;

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
  const category = await prisma.category.create({ data: { name: '메인', sortOrder: 0 } });
  const menuItem = await prisma.menuItem.create({
    data: { name: '김치찌개', price: 9000, handledBy: 'KITCHEN', categoryId: category.id },
  });
  const order = await prisma.order.create({ data: { tableSessionId: session.id } });
  orderId = order.id;
  await prisma.orderItem.create({
    data: { orderId, menuItemId: menuItem.id, quantity: 1, handledBy: 'KITCHEN', status: 'WAITING' },
  });
});
afterAll(() => prisma.$disconnect());

it('sets table to PICKUP_READY when any kitchen item is DONE', async () => {
  await prisma.orderItem.updateMany({ where: { orderId }, data: { status: 'DONE' } });
  await syncTableStatus(tableId);
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  expect(table?.status).toBe('PICKUP_READY');
});

it('sets table back to OCCUPIED when no items are DONE', async () => {
  await prisma.table.update({ where: { id: tableId }, data: { status: 'PICKUP_READY' } });
  await syncTableStatus(tableId);
  const table = await prisma.table.findUnique({ where: { id: tableId } });
  expect(table?.status).toBe('OCCUPIED');
});
