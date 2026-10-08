import { Router } from 'express';
import * as c from '../controllers/customerController.js';
import { objectIdParam } from '../middleware/objectIdParam.js';

export const customerRoutes = Router();
customerRoutes.param('id', objectIdParam('Customer'));
customerRoutes.route('/').get(c.listCustomers).post(c.createCustomer);
customerRoutes.route('/:id').get(c.getCustomer).patch(c.updateCustomer).put(c.updateCustomer).delete(c.deleteCustomer);
