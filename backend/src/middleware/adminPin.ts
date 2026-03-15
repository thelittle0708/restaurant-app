import { Request, Response, NextFunction } from 'express';

export function adminPinMiddleware(req: Request, res: Response, next: NextFunction) {
  const pin = req.headers['x-admin-pin'];
  const correctPin = process.env.ADMIN_PIN || '0000';
  if (pin !== correctPin) {
    res.status(401).json({ error: 'Invalid PIN' });
    return;
  }
  next();
}
