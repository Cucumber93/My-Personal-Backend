import { Router, type IRouter } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
} from '../controllers/projectController.js';

const router: IRouter = Router();

// GET /api/projects - Get all projects
router.get('/', getAllProjects);

// GET /api/projects/search?q=query - Search projects
router.get('/search', searchProjects);

// GET /api/projects/:id - Get project by ID
router.get('/:id', getProjectById);

// POST /api/projects - Create new project
router.post('/', createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', deleteProject);

export default router;

