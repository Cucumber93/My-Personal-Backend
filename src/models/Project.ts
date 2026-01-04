import pool from '../config/database.js';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../types/project.js';

class ProjectStore {
  async findAll(userId?: number): Promise<Project[]> {
    if (userId) {
      const result = await pool.query(
        `SELECT id, user_id as "userId", project_name as "projectName", image, description, 
         created_at as "createdAt", updated_at as "updatedAt" 
         FROM projects 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
        [userId]
      );
      return result.rows;
    }
    
    const result = await pool.query(
      `SELECT id, user_id as "userId", project_name as "projectName", image, description, 
       created_at as "createdAt", updated_at as "updatedAt" 
       FROM projects 
       ORDER BY created_at DESC`
    );
    return result.rows;
  }

  async findById(id: number): Promise<Project | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", project_name as "projectName", image, description, 
       created_at as "createdAt", updated_at as "updatedAt" 
       FROM projects 
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async findByUserIdAndId(userId: number, id: number): Promise<Project | null> {
    const result = await pool.query(
      `SELECT id, user_id as "userId", project_name as "projectName", image, description, 
       created_at as "createdAt", updated_at as "updatedAt" 
       FROM projects 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async create(data: CreateProjectDto): Promise<Project> {
    const result = await pool.query(
      `INSERT INTO projects (user_id, project_name, image, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id as "userId", project_name as "projectName", image, description, 
       created_at as "createdAt", updated_at as "updatedAt"`,
      [data.userId, data.projectName, data.image || null, data.description || null]
    );
    return result.rows[0];
  }

  async update(id: number, userId: number, data: UpdateProjectDto): Promise<Project | null> {
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (data.projectName !== undefined) {
      updates.push(`project_name = $${paramCount++}`);
      values.push(data.projectName);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.image !== undefined) {
      updates.push(`image = $${paramCount++}`);
      values.push(data.image);
    }

    if (updates.length === 0) {
      return this.findByUserIdAndId(userId, id);
    }

    values.push(id, userId);
    const query = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
      RETURNING id, user_id as "userId", project_name as "projectName", image, description, 
      created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }

  async search(query: string, userId?: number): Promise<Project[]> {
    if (userId) {
      const result = await pool.query(
        `SELECT id, user_id as "userId", project_name as "projectName", image, description, 
         created_at as "createdAt", updated_at as "updatedAt"
         FROM projects
         WHERE LOWER(project_name) LIKE LOWER($1) AND user_id = $2
         ORDER BY created_at DESC`,
        [`%${query}%`, userId]
      );
      return result.rows;
    }

    const result = await pool.query(
      `SELECT id, user_id as "userId", project_name as "projectName", image, description, 
       created_at as "createdAt", updated_at as "updatedAt"
       FROM projects
       WHERE LOWER(project_name) LIKE LOWER($1)
       ORDER BY created_at DESC`,
      [`%${query}%`]
    );
    return result.rows;
  }
}

export const projectStore = new ProjectStore();
