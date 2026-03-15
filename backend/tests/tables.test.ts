import request from 'supertest';
import { app } from '../src/index';
import { prisma } from '../src/lib/prisma';

beforeEach(async () => {
  await prisma.tableSession.deleteMany();
  await prisma.table.deleteMany();
});
afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/tables', () => {
  it('returns empty array when no tables', async () => {
    const res = await request(app).get('/api/tables');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all tables', async () => {
    await prisma.table.create({ data: { name: 'T1', x: 100, y: 100 } });
    const res = await request(app).get('/api/tables');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('T1');
  });
});

describe('POST /api/tables', () => {
  it('creates a table', async () => {
    const res = await request(app)
      .post('/api/tables')
      .set('x-admin-pin', process.env.ADMIN_PIN || '0000')
      .send({ name: 'T2', x: 200, y: 150 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('T2');
  });
});

describe('PATCH /api/tables/:id', () => {
  it('updates table position', async () => {
    const table = await prisma.table.create({ data: { name: 'T3', x: 0, y: 0 } });
    const res = await request(app)
      .patch(`/api/tables/${table.id}`)
      .set('x-admin-pin', process.env.ADMIN_PIN || '0000')
      .send({ x: 300, y: 200 });
    expect(res.status).toBe(200);
    expect(res.body.x).toBe(300);
  });
});
