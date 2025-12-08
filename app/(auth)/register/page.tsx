import { getIsAdmin } from '@/_lib/getisadmin';
import RegisterAdmin from './form-register-admin';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingRegister } from '@/_components/loadings/loading-register';

export const generateMetadata = async (): Promise<Metadata> => {
  const isAdmin = await getIsAdmin();
  return {
    title: isAdmin ? 'Register User' : 'Register Administrator'
  };
}

export default async function RegisterPage() {
  const isAdmin = await getIsAdmin();
  const Title = isAdmin ? 'Register User' : 'Register Administrator';
  return (
    <Suspense fallback={<LoadingRegister />}>
      <RegisterAdmin TitleIntl={Title} />
    </Suspense>
  );
}