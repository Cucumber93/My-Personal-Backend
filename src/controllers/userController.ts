import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { userStore } from '../models/User.js';
import type { CreateUserDto } from '../types/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateUserDto = req.body;

    // Validation
    if (!data.name || !data.email || !data.passwordHash) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await userStore.findByEmail(data.email);
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password (in production, use bcrypt or similar)
    // For now, we'll accept the password hash from the client
    // In production, you should hash it here: const passwordHash = await bcrypt.hash(data.password, 10);
    
    const user = await userStore.create(data);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Don't send password hash back
    const { passwordHash, ...userResponse } = user;
    
    res.status(201).json({
      token,
      user: {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, passwordHash } = req.body;

    // Validation
    if (!email || !passwordHash) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = await userStore.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password (in production, use bcrypt.compare)
    if (user.passwordHash !== passwordHash) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Don't send password hash back
    const { passwordHash: _, ...userResponse } = user;

    res.status(200).json({
      token,
      user: {
        id: userResponse.id,
        name: userResponse.name,
        email: userResponse.email,
        createdAt: userResponse.createdAt,
        updatedAt: userResponse.updatedAt,
      }
    });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: 'Failed to sign in' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid user ID' });
      return;
    }

    const user = await userStore.findById(id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Don't send password hash back
    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

