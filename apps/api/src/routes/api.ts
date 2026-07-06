import type { Router as ExpressRouter } from 'express';
import { Router } from 'express';
import {
  createProjectHandler,
  getProjectsHandler,
  updateProjectHandler,
} from '../controllers/projectsController.js';
import {
  createNoteHandler,
  getNoteHandler,
  getNotesHandler,
  updateNoteHandler,
} from '../controllers/notesController.js';
import {
  createTagHandler,
  deleteTagHandler,
  getTagsHandler,
  updateTagHandler,
} from '../controllers/tagsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router: ExpressRouter = Router();

router.use(authMiddleware);

router.get('/projects', getProjectsHandler);
router.post('/projects', createProjectHandler);
router.put('/projects/:id', updateProjectHandler);

router.get('/notes', getNotesHandler);
router.post('/notes', createNoteHandler);
router.get('/notes/:id', getNoteHandler);
router.put('/notes/:id', updateNoteHandler);

router.get('/tags', getTagsHandler);
router.post('/tags', createTagHandler);
router.put('/tags/:id', updateTagHandler);
router.delete('/tags/:id', deleteTagHandler);

export const apiRouter = router;
