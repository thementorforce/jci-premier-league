import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminLoginPage from './AdminLoginPage';

export default async function LoginPage() {
  const session = await getSession();
  if (session?.role === 'ADMIN') {
    redirect('/admin');
  }
  return <AdminLoginPage />;
}
