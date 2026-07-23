'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';

const AdminConsole = dynamic(() => import('./AdminConsole'), {
  loading: () => (
    <div className="admin-access-loading" role="status">
      <div><LoaderCircle className="animate-spin" size={30} /><p>Loading admin console…</p></div>
    </div>
  ),
  ssr: false,
});

export default function AdminAccessGate() {
  const router = useRouter();
  const [state, setState] = useState({ checking: true, username: '' });

  useEffect(() => {
    const token = localStorage.getItem('fcl_admin_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch('/api/auth/session', { headers })
      .then(async (res) => ({ ok: res.ok, data: await res.json() }))
      .then(({ ok, data }) => {
        if (!ok || !data.authenticated || data.user?.role !== 'ADMIN') {
          localStorage.removeItem('fcl_admin_token');
          router.replace('/admin/login');
          return;
        }
        setState({ checking: false, username: data.user.username });
      })
      .catch(() => {
        localStorage.removeItem('fcl_admin_token');
        router.replace('/admin/login');
      });
  }, [router]);

  if (state.checking) {
    return (
      <div className="admin-access-loading" role="status">
        <div><LoaderCircle className="animate-spin" size={30} /><p>Verifying secure admin access…</p></div>
      </div>
    );
  }

  if (!state.username) {
    return <div className="admin-access-loading"><ShieldAlert size={28} /></div>;
  }

  return <AdminConsole username={state.username} />;
}
