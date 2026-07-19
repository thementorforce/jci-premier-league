import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AdminConsole from './AdminConsole';

export default async function AdminPage() {
  const session = await getSession();

  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return <AdminConsole username={session.username} />;
}
