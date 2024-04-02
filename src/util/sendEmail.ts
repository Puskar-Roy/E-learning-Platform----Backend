import config from '../config/config';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const resend = new Resend(config.RESEND_API);
export const sendEmail = async (userId: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const token = uuidv4();
  await prisma.verificationToken.create({
    data: {
      token: token,
      userId: user.id,
    },
  });

  const backendURL = 'http://localhost:8000';
  const verificationLink = `${backendURL}/api/v0.1/auth/verify-email/${user.id}/?token=${token}`;
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: user.email,
    subject: 'Verify Your Email',
    html: `<p>Verify Your Email Address to complete the Auth process into your account!</p>
<p>Click <a href="${verificationLink}">here</a> to verify your email. Please note that this link will expire in 10 minutes.</p>`,
  });
};
