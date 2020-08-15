import express from 'express';

const routes = express.Router();

import ClassesController from './app/controllers/ClassesController';
import ConnectionsController from './app/controllers/ConnectionsController';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import UserPasswordController from './app/controllers/UserPasswordController';

import auth from './app/middlewares/auth';

const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const userController = new UserController();
const sessionController = new SessionController();
const userPasswordController = new UserPasswordController();

routes.post('/register', userController.create);

routes.post('/login', sessionController.create);

routes.post('/forget_password', userPasswordController.create);
routes.post('/reset_password', userPasswordController.edit);

routes.use(auth);

routes.put('/profile', userController.edit);

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);

export default routes;
