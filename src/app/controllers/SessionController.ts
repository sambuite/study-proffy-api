import { Request, Response } from 'express';
import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

import authConfig from '../../config/auth';

import db from '../../database/connection';

export default class SessionController {
  async create(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await db('users').where('email', email).first();

      if (!user) {
        return res.status(400).json({ message: 'Incorrect Email/Password' });
      }

      const passwordCompared = await compare(password, user.password);

      if (!passwordCompared) {
        return res.status(400).json({ message: 'Incorrect Email/Password' });
      }

      delete user.password;

      const token = sign({ userId: user.id }, authConfig.secret as string, {
        expiresIn: authConfig.expiresIn,
      });

      return res.status(200).json({ user, token });
    } catch (error) {
      console.log('Login error ', error);
      return res.status(200);
    }
  }
}
