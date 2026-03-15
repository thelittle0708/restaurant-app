import request from 'supertest';
import express from 'express';
import { adminPinMiddleware } from '../src/middleware/adminPin';

const app = express();
app.use(express.json());
app.use('/admin', adminPinMiddleware, (req, res) => res.json({ ok: true }));

describe('adminPin middleware', () => {
  const OLD_ENV = process.env;
  beforeEach(() => { process.env.ADMIN_PIN = '1234'; });
  afterEach(() => { process.env = OLD_ENV; });

  it('allows request with correct PIN in header', async () => {
    const res = await request(app).get('/admin').set('x-admin-pin', '1234');
    expect(res.status).toBe(200);
  });

  it('rejects request with wrong PIN', async () => {
    const res = await request(app).get('/admin').set('x-admin-pin', '0000');
    expect(res.status).toBe(401);
  });

  it('rejects request with no PIN', async () => {
    const res = await request(app).get('/admin');
    expect(res.status).toBe(401);
  });
});
