import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/lib/prisma';

let tableId: string;
beforeEach(async () => {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.table.deleteMany();
  const table = await prisma.table.create({ data: { name: 'T1', x: 0, y: 0 } });
  tableId = table.id;
});
afterAll(() => prisma.$disconnect());

describe('POST /api/sessions', () => {
  it('creates a session and sets table to OCCUPIED', async () => {
    const res = await request(app)
      .post('/api/sessions')
      .send({ tableId, partySize: 4, phoneLastDigits: '1234' });
    expect(res.status).toBe(201);
    expect(res.body.tableId).toBe(tableId);
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    expect(table?.status).toBe('OCCUPIED');
  });
});

describe('POST /api/sessions/:id/close', () => {
  it('closes session and sets table to EMPTY', async () => {
    const session = await prisma.tableSession.create({
      data: { tableId, partySize: 2 },
    });
    await prisma.table.update({ where: { id: tableId }, data: { status: 'OCCUPIED' } });
    const res = await request(app).post(`/api/sessions/${session.id}/close`);
    expect(res.status).toBe(200);
    const table = await prisma.table.findUnique({ where: { id: tableId } });
    expect(table?.status).toBe('EMPTY');
  });
});
