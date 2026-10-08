import { Router } from 'express';
import * as c from '../controllers/taskController.js';
import { objectIdParam } from '../middleware/objectIdParam.js';

export const taskRoutes = Router();
taskRoutes.param('id', objectIdParam('Task'));
taskRoutes.route('/').get(c.listTasks).post(c.createTask);
taskRoutes.route('/:id').get(c.getTask).patch(c.updateTask).put(c.updateTask).delete(c.deleteTask);
