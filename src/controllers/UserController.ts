import { Request, Response } from 'express';
import { hash } from 'bcryptjs';

import db from '../database/connection';

export default class UserController {
  async create(req: Request, res: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      email,
      password,
      is_teacher,
    } = req.body;

    const userExists = await db('users').where('email', email).first();

    if (userExists) {
      return res
        .status(401)
        .json({ message: 'Somebody is alreay using this email' });
    }

    try {
      const hashPassword = await hash(password, 8);

      const insertedUsersIds = await db
        .insert({
          name,
          avatar,
          whatsapp,
          bio,
          email,
          password: hashPassword,
          is_teacher,
        })
        .into('users');

      if (!insertedUsersIds[0]) return;

      return res.status(201).send();
    } catch (error) {
      console.log('register user error ', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }
}
