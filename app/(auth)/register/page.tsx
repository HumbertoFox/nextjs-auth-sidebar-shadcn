import { getIsAdmin } from '@/_lib/getisadmin';
import RegisterAdminClient from './form-register-admin-client';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
  const isAdmin = await getIsAdmin();
  return {
    title: isAdmin ? 'Register User' : 'Register Administrator'
  };
}

export default async function RegisterPage() {
  const [isAdmin, csrfToken] = await Promise.all([
    getIsAdmin(),
    getCsrfToken()
  ]);
  const Title = isAdmin ? 'Register User' : 'Register Administrator';
  return (
    <Suspense fallback={<LoadingRegister />}>
      <RegisterAdminClient
        TitleIntl={Title}
        csrfToken={csrfToken}
      />
    </Suspense>
  );
}