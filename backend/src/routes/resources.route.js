import { Router } from 'express';
import auth from '../middleware/auth.js';
import { upload } from '../services/uploads.js';
import { listResources, uploadResource, createLinkResource, deleteResource } from '../controllers/resource.controller.js';

const router = Router();
router.use(auth);

// List resources for a project
router.get('/:id/resources', listResources);

// Upload a file resource (field name: file)
router.post('/:id/resources/file', upload.single('file'), uploadResource);

// Create a link resource
router.post('/:id/resources/link', createLinkResource);

// Delete a resource
router.delete('/:id/resources/:resourceId', deleteResource);

export default router;
