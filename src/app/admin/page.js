import AdminAccessGate from './AdminAccessGate';

export default function AdminPage() {
  // Authentication is verified in the client gate. This supports Firebase Hosting,
  // where an API response cookie can occasionally be stripped before a server
  // navigation, while the signed bearer token remains available in the browser.
  return <AdminAccessGate />;
}
