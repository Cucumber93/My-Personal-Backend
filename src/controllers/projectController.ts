import type { Request, Response } from 'express';
import { projectStore } from '../models/Project.js';
import type { CreateProjectDto, UpdateProjectDto } from '../types/project.js';

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // Optional: Get userId from query or auth middleware
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const projects = await projectStore.findAll(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const project = await projectStore.findById(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const data: CreateProjectDto = req.body;

    // Validation
    if (!data.projectName || !data.userId) {
      res.status(400).json({ error: 'Project name and user ID are required' });
      return;
    }

    // Log image storage information
    if (data.image) {
      console.log(`📸 Saving project with MinIO image URL`);
      console.log(`   ✅ Image file: Stored in MinIO`);
      console.log(`   ✅ Image URL: Saved in PostgreSQL (projects.image)`);
      console.log(`   🔗 Link: Image URL → Project ID`);
    } else {
      console.log(`📝 Saving project without image`);
    }

    const project = await projectStore.create(data);
    
    console.log(`✅ Project created successfully:`);
    console.log(`   - Project ID: ${project.id}`);
    console.log(`   - Project Name: ${project.projectName}`);
    console.log(`   - Image URL: ${project.image || 'None'}`);
    console.log(`   - Storage: Image in MinIO, URL in PostgreSQL`);
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.body.userId || req.query.userId ? parseInt(req.body.userId || req.query.userId as string) : undefined;
    const data: UpdateProjectDto = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    // Log image storage information if image is being updated
    if (data.image !== undefined) {
      if (data.image) {
        console.log(`📸 Updating project ${id} with MinIO image URL`);
        console.log(`   ✅ Image file: Stored in MinIO`);
        console.log(`   ✅ Image URL: Updated in PostgreSQL (projects.image)`);
        console.log(`   🔗 Link: Image URL → Project ID ${id}`);
      } else {
        console.log(`📝 Removing image from project ${id}`);
      }
    }

    const project = await projectStore.update(id, userId, data);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    console.log(`✅ Project updated successfully:`);
    console.log(`   - Project ID: ${project.id}`);
    console.log(`   - Image URL: ${project.image || 'None'}`);
    console.log(`   - Storage: Image in MinIO, URL in PostgreSQL`);

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.body.userId || req.query.userId ? parseInt(req.body.userId || req.query.userId as string) : undefined;

    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const deleted = await projectStore.delete(id, userId);

    if (!deleted) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

export const searchProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, userId } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'Search query is required' });
      return;
    }

    const userIdNum = userId ? parseInt(userId as string) : undefined;
    const projects = await projectStore.search(q, userIdNum);
    res.json(projects);
  } catch (error) {
    console.error('Error searching projects:', error);
    res.status(500).json({ error: 'Failed to search projects' });
  }
};

