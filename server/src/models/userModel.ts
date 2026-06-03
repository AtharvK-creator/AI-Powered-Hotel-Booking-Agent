import { db } from '../config/database';
import { generateId } from '../utils/idGenerator';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export const userModel = {
  findById(id: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  findByEmail(email: string): User | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User | undefined;
  },

  create(data: { email: string; password: string; name: string; role?: string }): User {
    const id = generateId();
    const passwordHash = bcrypt.hashSync(data.password, 12);
    const role = data.role || 'user';

    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)'
    ).run(id, data.email, passwordHash, data.name, role);

    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User;
  },

  update(id: string, data: Partial<{ name: string; phone: string; avatar_url: string }>): User | undefined {
    const fields = Object.keys(data)
      .map((k) => `${k} = ?`)
      .join(', ');
    const values = [...Object.values(data), new Date().toISOString(), id];
    db.prepare(`UPDATE users SET ${fields}, updated_at = ? WHERE id = ?`).run(...values);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
  },

  updatePassword(id: string, newPassword: string): void {
    const hash = bcrypt.hashSync(newPassword, 12);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
      hash, new Date().toISOString(), id
    );
  },

  verifyPassword(user: User, password: string): boolean {
    return bcrypt.compareSync(password, user.password_hash);
  },

  toPublic(user: User): UserPublic {
    const { password_hash, ...pub } = user;
    return pub;
  },

  count(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    return row.count;
  },

  findAll(limit = 50, offset = 0): UserPublic[] {
    return db.prepare(
      'SELECT id, email, name, role, phone, avatar_url, created_at FROM users LIMIT ? OFFSET ?'
    ).all(limit, offset) as UserPublic[];
  },
};
