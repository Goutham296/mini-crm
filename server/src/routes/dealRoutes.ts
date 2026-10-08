import { Router } from 'express';
import * as c from '../controllers/dealController.js';
import { objectIdParam } from '../middleware/objectIdParam.js';

export const dealRoutes = Router();
dealRoutes.param('id', objectIdParam('Deal'));
dealRoutes.route('/').get(c.listDeals).post(c.createDeal);
dealRoutes.route('/:id').get(c.getDeal).patch(c.updateDeal).put(c.updateDeal).delete(c.deleteDeal);
dealRoutes.patch('/:id/stage', c.updateDealStage);
