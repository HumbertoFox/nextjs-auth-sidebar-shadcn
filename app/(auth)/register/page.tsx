import { getIsAdmin } from '@/lib/getisadmin';
import RegisterAdmin from './form-register-admin';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
  const isAdmin = await getIsAdmin();
  return {
    title: isAdmin ? 'Register User' : 'Register Administrator'
  };
};

export default async function RegisterPage() {
  const isAdmin = await getIsAdmin();
  const Title = isAdmin ? 'Register User' : 'Register Administrator';
  return <RegisterAdmin TitleIntl={Title} />;
}