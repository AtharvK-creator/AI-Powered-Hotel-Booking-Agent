import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { generateId } from './idGenerator';
import { db } from '../config/database';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as JwtPayload;
}

export function storeRefreshToken(userId: string, token: string): void {
  const id = generateId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)'
  ).run(id, userId, token, expiresAt);
}

export function invalidateRefreshToken(token: string): void {
  db.prepare('DELETE FROM refresh_tokens WHERE token = ?').run(token);
}

export function isRefreshTokenValid(token: string): boolean {
  const row = db.prepare(
    'SELECT id FROM refresh_tokens WHERE token = ? AND datetime(expires_at) > datetime(\'now\')'
  ).get(token);
  return !!row;
}
