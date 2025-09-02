import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createProject, listMyProjects, getProject, updateProjectSettings, listProjectMembers } from '../controllers/project.controller.js';
import { createTask, listTasks } from '../controllers/task.controller.js';

const router = Router();
router.use(auth);

router.post('/', createProject);
router.get('/', listMyProjects);
router.get('/:id', getProject);
router.patch('/:id', updateProjectSettings);
router.get('/:id/tasks', listTasks);
router.post('/:id/tasks', createTask);
router.get('/:id/members', listProjectMembers);

export default router;
