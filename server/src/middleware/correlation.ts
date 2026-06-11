import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { v4 as uuidv4 } from 'uuid';

export function correlationId(req: AuthRequest, res: Response, next: NextFunction): void {
  const correlationHeader = req.headers['x-correlation-id'] as string;
  const id = correlationHeader || uuidv4();
  
  // Attach correlation ID to request and response
  req.headers['x-correlation-id'] = id;
  res.setHeader('X-Correlation-ID', id);
  
  next();
}
