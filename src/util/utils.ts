import jwt from 'jsonwebtoken';
import config from '../config/config';
import { randomInt } from 'crypto';
import { Resend } from 'resend';

export const createToken = (_id: string) => {
  if (!_id) return;

  const secret: string = config.JWT_SECRET as string;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in config');
  }

  return jwt.sign({ _id }, secret, { expiresIn: '3d' });
};

export const generateOTP = (): string => {
  const otp = randomInt(100000, 1000000);
  return otp.toString();
};
