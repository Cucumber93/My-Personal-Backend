import pool from '../config/database.js';

export const initDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              BIGSERIAL PRIMARY KEY,
        name            VARCHAR(150) NOT NULL,
        email           VARCHAR(255) NOT NULL UNIQUE,
        password_hash   TEXT NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create projects table (1 user : many projects)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id            BIGSERIAL PRIMARY KEY,
        user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_name  VARCHAR(200) NOT NULL,
        image         TEXT,
        description   TEXT,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create index for query projects of user faster
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id)
    `);

    // Create index for search functionality
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_project_name ON projects(project_name)
    `);

    // Create function to update updated_at timestamp
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    // Create trigger for users table
    await pool.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    // Create trigger for projects table
    await pool.query(`
      DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
      CREATE TRIGGER update_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);

    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

