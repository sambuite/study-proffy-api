import { Request, Response } from 'express';
import { hash } from 'bcryptjs';

import db from '../../database/connection';

import convertHourToMinutes from '../../utils/convertHourToMinutes';

interface ClassData {
  id: number;
  cost: number;
  subject: string;
  user_id: number;
}

export default class UserController {
  async edit(req: Request, res: Response) {
    const { whatsapp, bio, schedule, class_id, cost } = req.body;
    const userId = req.userId;

    try {
      if (bio) {
        await db('users').where('id', userId).update({
          bio,
        });
      }
      if (whatsapp) {
        await db('users').where('id', userId).update({
          whatsapp,
        });
      }

      const classData: ClassData[] = await db('classes')
        .where('user_id', userId)
        .select();

      if (cost) {
        classData.map(async (classItem) => {
          const item = {
            ...classItem,
            cost,
          };

          await db('classes').where('id', classItem.id).update(item);
        });
      }

      if (schedule) {
        const from = convertHourToMinutes(schedule.from);
        const to = convertHourToMinutes(schedule.to);

        schedule.from = from;
        schedule.to = to;

        const classSchedule = await db('class_schedule')
          .where('class_id', class_id)
          .select();

        classSchedule.map(async (classItem) => {
          if (classItem.week_day === schedule.week_day) {
            console.log(classItem);
            await db('class_schedule')
              .where('class_id', class_id)
              .where('week_day', schedule.week_day)
              .update({
                from: schedule.from,
                to: schedule.to,
              });
          }
        });
      }

      return res.status(201).send();
    } catch (error) {
      console.log('edit error ', error);
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

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
