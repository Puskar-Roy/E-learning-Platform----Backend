import jwt from 'jsonwebtoken';
import config from '../config/config';
import { Resend } from 'resend';

export const createToken = (_id: string) => {
  return jwt.sign({ _id: _id }, config.JWT_SECRET, {
    expiresIn: config.JWT_COOKIE_EXPIRES_IN,
  });
};

export const generateOTP = (): string => {
  return Math.random().toString(36).substr(2, 6);
};
