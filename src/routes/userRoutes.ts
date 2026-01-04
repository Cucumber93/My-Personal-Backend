import { Router, type IRouter } from 'express';
import { signUp, signIn, getUserById } from '../controllers/userController.js';

const router: IRouter = Router();

// POST /api/users/signup - Create new user
router.post('/signup', signUp);

// POST /api/users/signin - Sign in user
router.post('/signin', signIn);

// GET /api/users/:id - Get user by ID
router.get('/:id', getUserById);

export default router;


