import { Request, Response } from 'express';
import asyncHandler from '../util/catchAsync';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { createToken } from '../util/utils';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw Error('All fields must be filled');
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error('Invalid credentials');
    }
    const token = createToken(user.id);
    return res.status(200).json({
      message: 'Login successful!',
      success: true,
      token: token,
      email: user.email,
      id: user.id,
    });
  } catch (error) {
    console.error('Login error:', error.message);
    if (error.message === 'Invalid credentials') {
      return res
        .status(401)
        .json({ message: 'Invalid email or password.', success: false });
    } else {
      return res.status(500).json({ message: 'Login failed.', success: false });
    }
  }
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    throw Error('All fields must be filled');
  }
  if (!validator.isEmail(email)) {
    throw Error('Email is not valid');
  }
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw Error('Email already in use');
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = await prisma.$transaction(async (prisma) => {
      const newUser = await prisma.user.create({
        data: { name, email, password: hash },
      });
      const token = createToken(newUser.id);
      return { user: newUser, token };
    });

    return res.status(201).json({
      message: 'Registration successful!',
      success: true,
      token: user.token,
      id: user.user.id,
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ message: error.message, success: false });
    } else {
      return res
        .status(500)
        .json({ message: 'Registration failed.', success: false });
    }
  }
});
