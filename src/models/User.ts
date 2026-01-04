import pool from '../config/database.js';
import type { User, CreateUserDto } from '../types/user.js';

class UserStore {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, name, email, password_hash as "passwordHash", 
       created_at as "createdAt", updated_at as "updatedAt" 
       FROM users 
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, name, email, password_hash as "passwordHash", 
       created_at as "createdAt", updated_at as "updatedAt" 
       FROM users 
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async create(data: CreateUserDto): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, password_hash as "passwordHash", 
       created_at as "createdAt", updated_at as "updatedAt"`,
      [data.name, data.email, data.passwordHash]
    );
    return result.rows[0];
  }
}

export const userStore = new UserStore();


