import prisma from '@/lib/prisma';
import RegisterAdmin from './form-register-admin';
import { Metadata } from 'next';

const isAdmin = await prisma.user.findFirst({
  where: {
    role: 'ADMIN'
  }
});

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: isAdmin ? 'Register User' : 'Register Administrator'
  };
};

export default async function RegisterPage() {
  const Title = isAdmin ? 'Register User' : 'Register Administrator';
  return <RegisterAdmin TitleIntl={Title} />;
}