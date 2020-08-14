import { Request, Response } from 'express';
import { hash } from 'bcryptjs';
import crypto from 'crypto';

import db from '../../database/connection';
import mailer from '../modules/mailer';

export default class UserPasswordController {
  async create(req: Request, res: Response) {
    const { email } = req.body;

    try {
      const user = await db('users').where('email', email).first();

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      const token = crypto.randomBytes(10).toString('hex');

      const expiresDate = new Date();
      expiresDate.setHours(expiresDate.getHours() + 1);

      await db('users').where('email', email).update({
        password_reset_token: token,
        password_reset_expires: expiresDate.toUTCString(),
      });

      mailer.sendMail(
        {
          to: email,
          from: 'murilosambuite@gmail.com',
          template: 'forget_password',
          context: {
            token,
          },
        },
        (error) => {
          if (error) console.log('sendmail error', error);
        }
      );

      return res.status(200).json({ message: 'Token sended to your email' });
    } catch (error) {
      console.log('Forget password error ', error);
      return res.status(401).json({ message: 'Forget password error' });
    }
  }

  async edit(req: Request, res: Response) {
    const { email, newPassword, token } = req.body;

    try {
      const user = await db('users').where('email', email).first();

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (token !== user.password_reset_token) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const now = new Date();
      const expires = new Date(user.password_reset_expires);

      if (now > expires) {
        return res
          .status(401)
          .json({ message: 'Token expired, generate a new one' });
      }

      const hashPassword = await hash(newPassword, 8);

      const d = await db('users').where('email', email).update({
        password: hashPassword,
      });

      return res.status(201).json({ message: 'Password Updated' });
    } catch (error) {
      return res.status(401).json({ message: 'Reset password error' });
    }
  }
}
