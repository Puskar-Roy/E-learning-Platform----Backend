import config from '../config/config';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const resend = new Resend(config.RESEND_API);
import { generateOTP } from './utils';

export const sendOTP = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const token = generateOTP();
  await prisma.verificationToken.create({
    data: {
      token: token,
      userId: user.id,
    },
  });

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: user.email,
    subject: 'RESET PASSWORD',
    html: `<p>Verify Your OTP For Reset Your Password, This Is Your OTP - ${token}</p>`,
  });
};
