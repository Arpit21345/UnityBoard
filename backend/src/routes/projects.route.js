import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createProject, listMyProjects, listUserProjects, getProject, updateProjectSettings, listProjectMembers, removeMember, deleteProject, leaveProject, joinPublicProject, joinPrivateProject } from '../controllers/project.controller.js';
import { createTask, listTasks } from '../controllers/task.controller.js';

const router = Router();
router.use(auth);


router.post('/join-private', joinPrivateProject); // Simple private project join
router.post('/', createProject);
router.get('/', listMyProjects);
router.get('/user/:userId', listUserProjects); // Get projects for specific user
router.get('/:id', getProject);
router.post('/:id/join', joinPublicProject); // Public project join (existing)
router.patch('/:id', updateProjectSettings);
router.get('/:id/tasks', listTasks);
router.post('/:id/tasks', createTask);
router.get('/:id/members', listProjectMembers);

router.delete('/:id/members/:userId', removeMember);
router.post('/:id/leave', leaveProject);
router.delete('/:id', deleteProject);

export default router;
