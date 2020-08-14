import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '../../config/auth';

interface TokenPayload {
  userId: number;
  iat: number;
  exp: number;
}

export default async function auth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = await verify(token, authConfig.secret as string);

    const { userId } = decoded as TokenPayload;

    req.headers.userId = userId.toString();

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
}
