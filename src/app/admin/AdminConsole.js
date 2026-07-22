'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play, Check, X, Plus, Trash2, RotateCcw, AlertTriangle,
  Radio, Coffee, Pause, Flag, Clock, Eye, EyeOff, IndianRupee,
  Users, Trophy, CreditCard, Image, LogOut, Shield, Search, UserRound, CalendarDays, ArrowRight,
  RefreshCw, Download,
} from 'lucide-react';

const AUCTION_STATUSES = [
  { key: 'NOT_STARTED', label: 'Not Started', icon: Clock, color: '#94a3b8' },
  { key: 'LIVE', label: 'Live', icon: Radio, color: '#10b981' },
  { key: 'BREAK', label: 'On Break', icon: Coffee, color: '#f59e0b' },
  { key: 'PAUSED', label: 'Paused', icon: Pause, color: '#ef4444' },
  { key: 'ENDED', label: 'Ended', icon: Flag, color: '#6366f1' },
];

export default function AdminConsole({ username = 'admin' }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });

  const [activePlayer, setActivePlayer] = useState(null);
  const [draftPool, setDraftPool] = useState([]);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const [shuffledPool, setShuffledPool] = useState([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [teams, setTeams] = useState([]);
  const [soldPlayers, setSoldPlayers] = useState([]);
  const [auctionSummary, setAuctionSummary] = useState({});
  const [auctionStatus, setAuctionStatus] = useState('NOT_STARTED');

  const [ads, setAds] = useState([]);
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [paymentStats, setPaymentStats] = useState({});
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [playerSearch, setPlayerSearch] = useState('');

  const [bidForm, setBidForm] = useState({ teamId: '', amount: '' });
  const [adForm, setAdForm] = useState({ title: '', imageUrl: '', targetUrl: '', contact: '', positions: [] });
  const [setupKey, setSetupKey] = useState('');
  const [configForm, setConfigForm] = useState({ upiId: '', payeeName: '', regFee: '', auctionStatus: 'NOT_STARTED' });
  const [adminTeams, setAdminTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ name: '', ownerName: '', ownerContact: '', pointsPurse: '100000', logoUrl: '' });

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: null, text: '' }), 5000);
  };

  const handleUnauthorized = (res) => {
    if (res.status === 401) {
      localStorage.removeItem('fcl_admin_token');
      router.push('/admin/login');
      return true;
    }
    return false;
  };

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('fcl_admin_token') : null;
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const abortRef = useRef(null);
  const isFetchingRef = useRef(false);

  const handleLogout = async () => {
    // Immediately abort any in-flight requests so logout isn't blocked
    if (abortRef.current) abortRef.current.abort();
    localStorage.removeItem('fcl_admin_token');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    router.push('/admin/login');
    router.refresh();
  };

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const configData = await res.json();
        setConfigForm(configData);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchConsoleData = useCallback(async () => {
    // Skip if a previous fetch is still running
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // Cancel any previous in-flight requests
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const signal = controller.signal;

    try {
      const authHeaders = getAuthHeaders();
      const opts = (extra = {}) => ({ ...extra, headers: { ...authHeaders, ...(extra.headers || {}) }, signal });

      const [auctionRes, adsRes, pendingRes, paymentsRes, adminTeamsRes] = await Promise.all([
        fetch('/api/auction/status', { signal }),
        fetch('/api/admin/ads', opts()),
        fetch('/api/admin/approve-player', opts()),
        fetch('/api/admin/payments', opts()),
        fetch('/api/admin/teams', opts()),
      ]);

      if ([adsRes, pendingRes, paymentsRes, adminTeamsRes].some((res) => handleUnauthorized(res))) return;

      if (auctionRes.ok) {
        const data = await auctionRes.json();
        setActivePlayer(data.activePlayer);
        setDraftPool(data.draftPool);
        setUnsoldPlayers(data.unsoldPlayers || []);
        setTeams(data.teams);
        setSoldPlayers(data.soldPlayers || []);
        setAuctionSummary(data.summary || {});
        setAuctionStatus(data.auctionStatus || 'NOT_STARTED');
      }

      if (adsRes.ok) setAds(await adsRes.json());
      if (pendingRes.ok) setPendingPlayers(await pendingRes.json());
      if (paymentsRes.ok) {
        const payData = await paymentsRes.json();
        setAllPayments(payData.players || []);
        setPaymentStats(payData.stats || {});
      }
      if (adminTeamsRes.ok) {
        setAdminTeams(await adminTeamsRes.json());
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e);
    } finally {
      isFetchingRef.current = false;
    }
  }, [router]);

  const handleAddTeam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(teamForm),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', `Franchise team "${data.team.name}" created successfully!`);
        setTeamForm({ name: '', ownerName: '', ownerContact: '', pointsPurse: '100000', logoUrl: '' });
        fetchConsoleData();
      } else {
        showStatus('error', data.error || 'Failed to create team');
      }
    } catch {
      showStatus('error', 'Failed to create team due to server error');
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Delete this team? This will also delete the owner user account.')) return;
    try {
      const res = await fetch(`/api/admin/teams?id=${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Team deleted successfully');
        fetchConsoleData();
      } else {
        showStatus('error', data.error || 'Failed to delete team');
      }
    } catch {
      showStatus('error', 'Failed to delete team due to server error');
    }
  };

  useEffect(() => {
    fetchConfig();
    fetchConsoleData();
    const interval = setInterval(fetchConsoleData, 8000);
    return () => {
      clearInterval(interval);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchConfig, fetchConsoleData]);

  // Sync shuffled draft pool with polling updates
  useEffect(() => {
    if (!isShuffled) {
      setShuffledPool(draftPool);
    } else {
      const currentIds = new Set(draftPool.map(p => p.id));
      const existingShuffled = shuffledPool.filter(p => currentIds.has(p.id));
      const existingIds = new Set(existingShuffled.map(p => p.id));
      const newPlayers = draftPool.filter(p => !existingIds.has(p.id));
      setShuffledPool([...existingShuffled, ...newPlayers]);
    }
  }, [draftPool, isShuffled]);

  const handleShufflePool = () => {
    const shuffled = [...draftPool].sort(() => Math.random() - 0.5);
    setShuffledPool(shuffled);
    setIsShuffled(true);
  };

  const handleResetSort = () => {
    setIsShuffled(false);
  };

  const handleResetUnsold = async (playerId) => {
    try {
      const res = await fetch('/api/admin/reset-unsold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ playerId })
      });
      if (res.ok) {
        showStatus('success', 'Player moved back to draft pool');
        fetchConsoleData();
      } else {
        const err = await res.json();
        showStatus('error', err.error || 'Failed to reset player');
      }
    } catch {
      showStatus('error', 'Failed to communicate with server');
    }
  };

  const handleExportTeamCSV = (team) => {
    const players = team.players || [];
    if (players.length === 0) {
      alert("No players have been drafted to this team yet.");
      return;
    }
    
    const headers = ["Player Name", "Email", "Mobile Number", "Organization", "Preferred Role", "Experience", "Sold Price"];
    const rows = players.map(p => [
      p.fullName,
      p.email || '',
      p.mobileNumber || '',
      p.organization || '',
      p.preferredRole || '',
      p.experience || '',
      p.soldPrice || 0
    ]);
    
    const csvString = [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${team.name.replace(/\s+/g, '_')}_players.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSetAuctionStatus = async (status) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ ...configForm, auctionStatus: status }),
      });
      if (res.ok) {
        setAuctionStatus(status);
        setConfigForm((prev) => ({ ...prev, auctionStatus: status }));
        showStatus('success', `Auction status set to ${status.replace('_', ' ')}`);
      }
    } catch {
      showStatus('error', 'Failed to update auction status');
    }
  };

  const handleStartBidding = async (playerId) => {
    try {
      const res = await fetch('/api/admin/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ playerId }),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', `${data.player.fullName} is now LIVE on the auction block`);
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to start bidding');
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!activePlayer) return;
    try {
      const res = await fetch('/api/admin/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          playerId: activePlayer.id,
          teamId: bidForm.teamId,
          amount: parseInt(bidForm.amount, 10),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Bid placed successfully');
        setBidForm({ ...bidForm, amount: '' });
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to place bid');
    }
  };

  const handleCompleteSale = async () => {
    if (!activePlayer) return;
    if (!confirm(`Assign ${activePlayer.fullName} to ${activePlayer.highestBidder} for ${activePlayer.currentBid.toLocaleString()} pts?`)) return;
    try {
      const res = await fetch('/api/admin/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ playerId: activePlayer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || 'Player added to team');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to record sale');
    }
  };

  const handleMarkUnsold = async () => {
    if (!activePlayer) return;
    try {
      const res = await fetch('/api/admin/unsold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ playerId: activePlayer.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Player marked as unsold');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to mark unsold');
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!confirm(`Permanently delete player "${playerName}"? This cannot be undone. If the player was sold, points will be refunded to the team.`)) return;
    try {
      const res = await fetch(`/api/admin/delete-player?id=${playerId}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || 'Player deleted successfully');
        fetchConsoleData();
      } else {
        showStatus('error', data.error || 'Failed to delete player');
      }
    } catch {
      showStatus('error', 'Server error while deleting player');
    }
  };

  const handleApprovePlayer = async (playerId, action) => {
    try {
      const res = await fetch('/api/admin/approve-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ playerId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', action === 'approve' ? (data.emailSent ? 'Payment approved and confirmation email sent' : 'Payment approved - player added to draft pool') : 'Registration rejected');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Server connection error');
    }
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    if (!adForm.imageUrl) {
      showStatus('error', 'Please upload an image file or enter an image URL');
      return;
    }
    if (!adForm.positions || adForm.positions.length === 0) {
      showStatus('error', 'Please select at least one page route to display the sponsor');
      return;
    }
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          title: adForm.title,
          imageUrl: adForm.imageUrl,
          targetUrl: adForm.targetUrl,
          contact: adForm.contact,
          position: adForm.positions.join(',')
        }),
      });
      if (res.ok) {
        showStatus('success', 'Sponsor banner added');
        setAdForm({ title: '', imageUrl: '', targetUrl: '', contact: '', positions: [] });
        fetchConsoleData();
      } else {
        const data = await res.json();
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to create banner');
    }
  };

  const handleAdImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showStatus('error', 'Image file size should be less than 3MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdForm((prev) => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeamLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showStatus('error', 'Logo file size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamForm((prev) => ({ ...prev, logoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleAd = async (id, active) => {
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ id, active }),
      });
      if (res.ok) {
        showStatus('success', active ? 'Banner activated' : 'Banner hidden');
        fetchConsoleData();
      }
    } catch {
      showStatus('error', 'Failed to update banner');
    }
  };

  const handleDeleteAd = async (id) => {
    if (!confirm('Delete this sponsor banner?')) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE', headers: { ...getAuthHeaders() } });
      if (res.ok) {
        showStatus('success', 'Banner deleted');
        fetchConsoleData();
      }
    } catch {
      showStatus('error', 'Failed to delete banner');
    }
  };

  const handleUpdateConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(configForm),
      });
      if (res.ok) {
        showStatus('success', 'UPI & fee settings saved');
      } else {
        const data = await res.json();
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to update settings');
    }
  };

  const handleResetSystem = async () => {
    if (setupKey !== 'RESET') {
      showStatus('error', "Type 'RESET' to confirm");
      return;
    }
    if (!confirm('Reset all players, bids, teams, and ads? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_all' }),
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message);
        setSetupKey('');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch {
      showStatus('error', 'Failed to reset database');
    }
  };

  const currentStatusConfig = AUCTION_STATUSES.find((s) => s.key === auctionStatus) || AUCTION_STATUSES[0];

  const filteredPayments = allPayments.filter((p) => {
    const matchesPayment = paymentFilter === 'all'
      || (paymentFilter === 'pending' && p.paymentStatus === 'Pending')
      || (paymentFilter === 'approved' && p.paymentStatus === 'Approved');
    const query = playerSearch.trim().toLowerCase();
    const matchesSearch = !query || [p.fullName, p.email, p.mobileNumber, p.organization, p.preferredRole, p.transactionId]
      .some((value) => value?.toLowerCase().includes(query));
    return matchesPayment && matchesSearch;
  });

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Users },
    { id: 'auction', label: 'Auction Control', icon: Trophy },
    { id: 'payments', label: `Registered Players (${pendingPlayers.length} pending)`, icon: Users },
    { id: 'teams', label: 'Franchise Teams', icon: Shield },
    { id: 'sponsors', label: 'Sponsor Banners', icon: Image },
    { id: 'settings', label: 'UPI & Settings', icon: IndianRupee },
  ];

  return (
    <div className="page-container admin-console">

      {/* Header */}
      <div className="admin-header admin-console-header">
        <div>
          <p className="eyebrow" style={{ margin: '0 0 8px' }}><Shield size={14} /> League operations</p>
          <h1 className="page-title">Command centre</h1>
          <p className="admin-header-copy">Signed in as <strong>{username}</strong> · monitor registrations, verify payments, and run the auction from one place.</p>
        </div>
        <button onClick={handleLogout} className="premium-button-secondary" style={{ padding: '8px 16px', fontSize: '13px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Status toast */}
      {statusMessage.text && (
        <div style={{
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          padding: '12px 20px', borderRadius: '8px', fontWeight: '600', fontSize: '14px',
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Auction Status Control Bar */}
      <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              background: currentStatusConfig.color,
              boxShadow: auctionStatus === 'LIVE' ? `0 0 12px ${currentStatusConfig.color}` : 'none',
              animation: auctionStatus === 'LIVE' ? 'pulse-glow 2s infinite' : 'none',
            }} />
            <div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Auction Status</p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: currentStatusConfig.color }}>{currentStatusConfig.label}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {AUCTION_STATUSES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleSetAuctionStatus(key)}
                className={auctionStatus === key ? 'premium-button' : 'premium-button-secondary'}
                style={{
                  padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                  ...(auctionStatus === key ? { background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`, color: '#070b19' } : {}),
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Sold', value: auctionSummary.sold || 0, color: 'var(--success)' },
            { label: 'Unsold', value: auctionSummary.unsold || 0, color: 'var(--danger)' },
            { label: 'In Draft Pool', value: auctionSummary.registered || 0, color: 'var(--accent-teal)' },
            { label: 'Live Now', value: activePlayer ? 1 : 0, color: 'var(--accent-gold)' },
          ].map((s) => (
            <div key={s.label} style={{ background: 'rgba(7, 11, 25, 0.5)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '10px 14px', textAlign: 'center' }}>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{s.label}</p>
              <p style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={activeTab === id ? 'premium-button' : 'premium-button-secondary'}
            style={{ borderRadius: '8px', padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {/* TAB: Dashboard */}
      {activeTab === 'overview' && (
        <div className="admin-dashboard">
          <section className="admin-metric-grid">
            {[
              { label: 'Player registrations', value: paymentStats.total || 0, note: 'Complete player records', icon: Users, color: 'var(--text-primary)' },
              { label: 'Needs payment review', value: paymentStats.pending || 0, note: 'Requires a decision', icon: CreditCard, color: 'var(--accent-gold)' },
              { label: 'Payment cleared', value: paymentStats.approved || 0, note: 'Eligible for draft', icon: Check, color: 'var(--success)' },
              { label: 'Auction pool', value: auctionSummary.registered || 0, note: 'Ready to go live', icon: Trophy, color: 'var(--accent-teal)' },
            ].map(({ label, value, note, icon: Icon, color }) => (
              <div className="admin-metric-card" key={label}>
                <div className="admin-metric-icon" style={{ color }}><Icon size={19} /></div>
                <p>{label}</p><strong style={{ color }}>{value}</strong><span>{note}</span>
              </div>
            ))}
          </section>

          <section className="admin-dashboard-grid">
            <div className="admin-panel">
              <div className="admin-panel-heading"><div><p className="admin-kicker">Verification queue</p><h2>Payments awaiting review</h2></div><button onClick={() => setActiveTab('payments')} className="admin-text-button">Open player ledger <ArrowRightIcon /></button></div>
              {pendingPlayers.length ? (
                <div className="admin-queue-list">
                  {pendingPlayers.slice(0, 4).map((player) => <QueuePlayer key={player.id} player={player} onApprove={handleApprovePlayer} />)}
                </div>
              ) : <EmptyState title="Your verification queue is clear" text="New payment submissions will appear here as soon as players register." />}
            </div>
            <div className="admin-panel admin-auction-brief">
              <div className="admin-panel-heading"><div><p className="admin-kicker">Auction signal</p><h2>{currentStatusConfig.label}</h2></div><span className={`admin-status-dot ${auctionStatus === 'LIVE' ? 'is-live' : ''}`} style={{ background: currentStatusConfig.color }} /></div>
              {activePlayer ? <><p className="admin-brief-label">On the block</p><h3>{activePlayer.fullName}</h3><p className="admin-brief-meta">{activePlayer.preferredRole} · {activePlayer.organization}</p><div className="admin-bid-brief"><span>Current bid</span><strong>{activePlayer.currentBid.toLocaleString()} <small>PTS</small></strong><b>{activePlayer.highestBidder}</b></div></> : <EmptyState title="No player live right now" text="Choose an approved player in Auction Control to begin the next bidding round." />}
              <button onClick={() => setActiveTab('auction')} className="admin-outline-button">Open auction control <Trophy size={15} /></button>
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><p className="admin-kicker">Latest registrations</p><h2>Player intake</h2></div><button onClick={() => setActiveTab('payments')} className="admin-text-button">View all records <ArrowRightIcon /></button></div>
            <div className="admin-intake-table">
              <div className="admin-intake-head"><span>Player</span><span>Role & organisation</span><span>Payment</span><span>Registered</span></div>
              {allPayments.slice(0, 6).map((player) => <IntakeRow key={player.id} player={player} />)}
            </div>
          </section>
        </div>
      )}

      {/* TAB: Auction Control */}
      {activeTab === 'auction' && (
        <div className="grid-admin-auction">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Active Player Desk */}
            <div className="premium-card">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-teal)' }}>
                Live Auction Desk
              </h2>
              {activePlayer ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--accent-gold)' }}>
                      {activePlayer.photoUrl ? (
                        <img src={activePlayer.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Users size={28} color="var(--text-secondary)" />
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{activePlayer.fullName}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {activePlayer.preferredRole} &bull; {activePlayer.organization} &bull; {activePlayer.experience}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Highest Bidder</span>
                      <p style={{ fontWeight: '700', color: 'var(--accent-gold)', fontSize: '16px' }}>{activePlayer.highestBidder}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Current Bid</span>
                      <p style={{ fontWeight: '800', color: 'var(--accent-gold)', fontSize: '24px' }}>{activePlayer.currentBid.toLocaleString()} pts</p>
                    </div>
                  </div>

                  {/* Bid form */}
                  <form onSubmit={handlePlaceBid} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '2', minWidth: '180px' }}>
                      <label className="form-label">Franchise Team</label>
                      <select required value={bidForm.teamId} onChange={(e) => setBidForm({ ...bidForm, teamId: e.target.value })} className="premium-select">
                        <option value="">Select Team</option>
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>{t.name} (Left: {(t.pointsPurse - t.pointsSpent).toLocaleString()})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: '1', minWidth: '100px' }}>
                      <label className="form-label">Bid Amount</label>
                      <input type="number" required placeholder="Points" value={bidForm.amount} onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })} className="premium-input" />
                    </div>
                    <button type="submit" className="premium-button" style={{ height: '48px', padding: '0 24px' }}>Place Bid</button>
                  </form>

                  {/* Bid history */}
                  {activePlayer.bidHistory?.length > 0 && (
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '8px' }}>BID HISTORY</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                        {activePlayer.bidHistory.map((b, i) => (
                          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: i === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(7, 11, 25, 0.4)', borderRadius: '6px', fontSize: '13px', border: i === 0 ? '1px solid var(--success)' : '1px solid var(--card-border)' }}>
                            <span>{b.teamName}</span>
                            <span style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{b.amount.toLocaleString()} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Complete sale / unsold */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleCompleteSale} className="premium-button" style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                      <Check size={18} /> Add to Purchased Team
                    </button>
                    <button onClick={handleMarkUnsold} className="premium-button-secondary" style={{ flex: 1, border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                      <X size={18} /> Mark Unsold
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)' }}>
                  <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <p>No player is live. Select a registered player from the draft pool to start bidding.</p>
                </div>
              )}
            </div>

            {/* Team purses */}
            <div className="premium-card">
              <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px' }}>Franchise Purse Status</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {teams.map((t) => (
                  <div key={t.id} style={{ background: 'rgba(7, 11, 25, 0.5)', border: '1px solid var(--card-border)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: '700', fontSize: '13px' }}>{t.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Spent: {t.pointsSpent.toLocaleString()}</p>
                    <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-teal)', marginTop: '4px' }}>{(t.pointsPurse - t.pointsSpent).toLocaleString()} left</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recently sold */}
            {soldPlayers.length > 0 && (
              <div className="premium-card">
                <h2 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '12px', color: 'var(--success)' }}>Recently Sold</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {soldPlayers.slice(0, 5).map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(7, 11, 25, 0.4)', borderRadius: '6px', fontSize: '13px' }}>
                      <span style={{ fontWeight: '600' }}>{p.fullName}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span>{p.team?.name} &mdash; <strong style={{ color: 'var(--accent-gold)' }}>{p.soldPrice?.toLocaleString()} pts</strong></span>
                        <button
                          onClick={() => handleDeletePlayer(p.id, p.fullName)}
                          className="premium-button-secondary"
                          style={{ padding: '5px', borderRadius: '50%', border: '1px solid var(--danger)', color: 'var(--danger)', flexShrink: 0 }}
                          title="Delete sold player (refunds points to team)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Draft Pool Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignSelf: 'start' }}>
            
            {/* Draft Pool */}
            <div className="premium-card" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-gold)', margin: 0 }}>
                  Draft Pool ({draftPool.length})
                </h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {isShuffled ? (
                    <button 
                      onClick={handleResetSort} 
                      className="premium-button-secondary" 
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={11} /> Sort A-Z
                    </button>
                  ) : (
                    <button 
                      onClick={handleShufflePool} 
                      className="premium-button-secondary" 
                      style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span>🎲 Shuffle</span>
                    </button>
                  )}
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
                Approved players ready to go live on auction {isShuffled && '• Shuffled'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
                {shuffledPool.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No players in draft pool. Approve payments first.</p>
                ) : (
                  shuffledPool.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(7, 11, 25, 0.4)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{p.fullName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.preferredRole} &bull; {p.organization}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button onClick={() => handleStartBidding(p.id)} className="premium-button" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Play size={12} /> Go Live
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(p.id, p.fullName)}
                          className="premium-button-secondary"
                          style={{ padding: '6px', borderRadius: '50%', border: '1px solid var(--danger)', color: 'var(--danger)' }}
                          title="Delete player"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Unsold Pool */}
            <div className="premium-card" style={{ width: '100%' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--danger)', marginBottom: '8px' }}>
                Unsold Pool ({unsoldPlayers.length})
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '16px' }}>
                Players who went unsold. Move them back to the draft pool if needed.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                {unsoldPlayers.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No unsold players yet.</p>
                ) : (
                  unsoldPlayers.map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(7, 11, 25, 0.4)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                      <div>
                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{p.fullName}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.preferredRole} &bull; {p.organization}</p>
                      </div>
                      <button 
                        onClick={() => handleResetUnsold(p.id)} 
                        className="premium-button-secondary" 
                        style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--success)', color: 'var(--success)' }}
                      >
                        <RefreshCw size={12} /> Move to Draft
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: Payments */}
      {activeTab === 'payments' && (
        <div className="admin-player-ledger">
          {/* Payment stats */}
          <div className="admin-metric-grid">
            {[
              { label: 'Total Registrations', value: paymentStats.total || 0 },
              { label: 'Pending Verification', value: paymentStats.pending || 0, color: 'var(--accent-gold)' },
              { label: 'Approved Payments', value: paymentStats.approved || 0, color: 'var(--success)' },
              { label: 'Total Revenue', value: `\u20B9${(paymentStats.totalRevenue || 0).toLocaleString()}`, color: 'var(--accent-teal)' },
            ].map((s) => (
              <div key={s.label} className="admin-metric-card">
                <p>{s.label}</p>
                <strong style={{ color: s.color || 'var(--text-primary)' }}>{s.value}</strong>
              </div>
            ))}
          </div>

          {/* Pending approvals */}
          {pendingPlayers.length > 0 && (
            <div className="premium-card">
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-gold)', marginBottom: '16px' }}>
                Pending Verification ({pendingPlayers.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingPlayers.map((p) => (
                  <PaymentCard key={p.id} player={p} onApprove={(id, action) => handleApprovePlayer(id, action)} showActions />
                ))}
              </div>
            </div>
          )}

          {/* Complete player and payment ledger */}
          <div className="admin-panel">
            <div className="admin-panel-heading admin-ledger-heading">
              <div><p className="admin-kicker">Complete player register</p><h2>Players & payment ledger</h2><p>Every registration field, payment proof, and current auction status in one searchable view.</p></div>
              <div className="admin-ledger-controls">
                <label className="admin-search"><Search size={17} /><input value={playerSearch} onChange={(e) => setPlayerSearch(e.target.value)} placeholder="Search name, phone, UTR…" /></label>
                <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'pending', 'approved'].map((f) => (
                  <button key={f} onClick={() => setPaymentFilter(f)} className={paymentFilter === f ? 'premium-button' : 'premium-button-secondary'} style={{ padding: '4px 14px', fontSize: '12px', textTransform: 'capitalize' }}>
                    {f}
                  </button>
                ))}
                </div>
              </div>
            </div>
            <p className="admin-ledger-count">Showing {filteredPayments.length} of {allPayments.length} player records</p>
            <div className="admin-record-list">
              {filteredPayments.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>No payment records found.</p>
              ) : (
                filteredPayments.map((p) => (
                  <PlayerRecord key={p.id} player={p} onApprove={handleApprovePlayer} onDelete={handleDeletePlayer} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Franchise Teams */}
      {activeTab === 'teams' && (
        <div className="grid-admin-sponsors" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          
          {/* Add Team Card */}
          <div className="premium-card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-teal)' }}>
              Add Franchise Team
            </h2>
            <form onSubmit={handleAddTeam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Team Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Tumkur Titans" 
                  value={teamForm.name} 
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} 
                  className="premium-input" 
                />
              </div>
              <div>
                <label className="form-label">Owner Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Rajesh Gowda" 
                  value={teamForm.ownerName} 
                  onChange={(e) => setTeamForm({ ...teamForm, ownerName: e.target.value })} 
                  className="premium-input" 
                />
              </div>
              <div>
                <label className="form-label">Owner Contact Detail</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 98765 43210" 
                  value={teamForm.ownerContact} 
                  onChange={(e) => setTeamForm({ ...teamForm, ownerContact: e.target.value })} 
                  className="premium-input" 
                />
              </div>
              <div>
                <label className="form-label">Points Purse (Total Budget)</label>
                <input 
                  type="number" 
                  placeholder="100000" 
                  value={teamForm.pointsPurse} 
                  onChange={(e) => setTeamForm({ ...teamForm, pointsPurse: e.target.value })} 
                  className="premium-input" 
                />
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Default is 100,000 points if left empty.
                </p>
              </div>
              <div>
                <label className="form-label">Team Logo *</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '6px 0 10px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(7, 11, 25, 0.8)',
                      border: teamForm.logoUrl ? '2px solid var(--accent-teal)' : '1px dashed var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {teamForm.logoUrl ? (
                      <img src={teamForm.logoUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Shield size={24} color="var(--text-secondary)" />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="team-logo-upload"
                      required
                      onChange={handleTeamLogoUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="team-logo-upload"
                      className="premium-button-secondary"
                      style={{ padding: '6px 14px', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Image size={14} /> Upload Logo File
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Max file size: 2MB</span>
                  </div>
                </div>
              </div>
              <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}>
                <Plus size={18} /> Add Franchise Team
              </button>
            </form>
          </div>

          {/* Teams List Card */}
          <div className="premium-card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>
              Franchise Teams ({adminTeams.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '600px', overflowY: 'auto' }}>
              {adminTeams.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  No franchise teams configured. Use the form to add one.
                </p>
              ) : (
                adminTeams.map((t) => {
                  const remainingPurse = t.pointsPurse - t.pointsSpent;
                  const draftedCount = t.players?.length || 0;
                  return (
                    <div 
                      key={t.id} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '12px', 
                        background: 'rgba(7, 11, 25, 0.4)', 
                        border: '1px solid var(--card-border)', 
                        padding: '16px', 
                        borderRadius: '10px' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {t.logoUrl ? (
                            <img src={t.logoUrl} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--accent-gold)' }} />
                          ) : (
                            <Shield size={20} color="var(--accent-gold)" />
                          )}
                          <div>
                            <p style={{ fontWeight: '800', fontSize: '15px' }}>{t.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Owner: <strong>{t.ownerName}</strong> {t.ownerContact ? `(${t.ownerContact})` : ''}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteTeam(t.id)} 
                          className="premium-button-secondary" 
                          style={{ 
                            padding: '6px', 
                            borderRadius: '50%', 
                            border: draftedCount > 0 ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid var(--danger)', 
                            color: draftedCount > 0 ? 'var(--text-secondary)' : 'var(--danger)',
                            opacity: draftedCount > 0 ? 0.4 : 1
                          }} 
                          disabled={draftedCount > 0}
                          title={draftedCount > 0 ? 'Cannot delete team with drafted players' : 'Delete Team'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Stats Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '12px' }}>
                        <div style={{ background: 'rgba(7, 11, 25, 0.3)', padding: '6px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Budget Purse</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{t.pointsPurse.toLocaleString()}</strong>
                        </div>
                        <div style={{ background: 'rgba(7, 11, 25, 0.3)', padding: '6px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Spent</span>
                          <strong style={{ color: 'var(--danger)' }}>{t.pointsSpent.toLocaleString()}</strong>
                        </div>
                        <div style={{ background: 'rgba(7, 11, 25, 0.3)', padding: '6px', borderRadius: '4px' }}>
                          <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block' }}>Drafted</span>
                          <strong style={{ color: 'var(--success)' }}>{draftedCount}</strong>
                        </div>
                      </div>

                      {/* Export Button */}
                      {draftedCount > 0 && (
                        <button
                          onClick={() => handleExportTeamCSV(t)}
                          className="premium-button"
                          style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '8px 12px', marginTop: '4px', gap: '6px' }}
                        >
                          <Download size={14} /> Export Squad Excel
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Sponsor Banners */}
      {activeTab === 'sponsors' && (
        <div className="grid-admin-sponsors">
          <div className="premium-card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-teal)' }}>Add Sponsor Banner</h2>
            <form onSubmit={handleAddAd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Sponsor Title</label>
                <input type="text" required placeholder="e.g. Decathlon Tumkur" value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} className="premium-input" />
              </div>
              <div>
                <label className="form-label">Sponsor Image *</label>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center', margin: '6px 0 10px' }}>
                  <div
                    style={{
                      width: '90px',
                      height: '60px',
                      borderRadius: '8px',
                      background: 'rgba(7, 11, 25, 0.8)',
                      border: adForm.imageUrl ? '2px solid var(--accent-teal)' : '1px dashed var(--card-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}
                  >
                    {adForm.imageUrl ? (
                      <img src={adForm.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Image size={24} color="var(--text-secondary)" />
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="sponsor-image-upload"
                      onChange={handleAdImageUpload}
                      style={{ display: 'none' }}
                    />
                    <label
                      htmlFor="sponsor-image-upload"
                      className="premium-button-secondary"
                      style={{ padding: '6px 14px', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Image size={14} /> Upload Image File
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Max file size: 3MB</span>
                  </div>
                </div>

                <label className="form-label" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>OR Image Web URL</label>
                <input type="text" placeholder="https://example.com/banner.jpg" value={adForm.imageUrl} onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })} className="premium-input" />
              </div>
              <div>
                <label className="form-label">Click-through URL</label>
                <input type="text" placeholder="https://sponsor-website.com" value={adForm.targetUrl} onChange={(e) => setAdForm({ ...adForm, targetUrl: e.target.value })} className="premium-input" />
              </div>
              <div>
                <label className="form-label">Sponsor Contact Detail *</label>
                <input type="text" required placeholder="e.g. +91 98765 43210" value={adForm.contact} onChange={(e) => setAdForm({ ...adForm, contact: e.target.value })} className="premium-input" />
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>Display Placements (Choose where to show) *</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '6px 0' }}>
                  {[
                    { path: '/', label: 'Home Page' },
                    { path: '/register-player', label: 'Player Register Page' },
                    { path: '/teams', label: 'Teams Page' },
                    { path: '/auction', label: 'Live Auction Arena' },
                  ].map((p) => (
                    <label key={p.path} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={adForm.positions ? adForm.positions.includes(p.path) : false}
                        onChange={(e) => {
                          const currentPos = adForm.positions || [];
                          const nextPos = e.target.checked
                            ? [...currentPos, p.path]
                            : currentPos.filter((x) => x !== p.path);
                          setAdForm({ ...adForm, positions: nextPos });
                        }}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-teal)' }}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}><Plus size={18} /> Add Banner</button>
            </form>
          </div>

          <div className="premium-card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Banner Placements ({ads.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '600px', overflowY: 'auto' }}>
              {ads.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No sponsor banners configured.</p>
              ) : (
                ads.map((ad) => (
                  <div key={ad.id} style={{ display: 'flex', gap: '14px', background: 'rgba(7, 11, 25, 0.4)', border: `1px solid ${ad.active ? 'var(--card-border)' : 'rgba(239,68,68,0.3)'}`, padding: '12px', borderRadius: '10px', alignItems: 'center', opacity: ad.active ? 1 : 0.6 }}>
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80'; }}
                      style={{ width: '90px', height: '60px', objectFit: 'cover', borderRadius: '6px', background: 'var(--bg-secondary)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '700', fontSize: '14px' }}>{ad.title}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Contact: {ad.contact || 'None'}</p>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <span className="badge badge-registered" style={{ fontSize: '9px' }}>{ad.position}</span>
                        <span className="badge" style={{ fontSize: '9px', background: ad.active ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: ad.active ? 'var(--success)' : 'var(--danger)' }}>
                          {ad.active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleToggleAd(ad.id, !ad.active)} className="premium-button-secondary" style={{ padding: '8px', borderRadius: '50%' }} title={ad.active ? 'Hide' : 'Show'}>
                        {ad.active ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => handleDeleteAd(ad.id)} className="premium-button-secondary" style={{ padding: '8px', borderRadius: '50%', border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: UPI & Settings */}
      {activeTab === 'settings' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="premium-card">
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-teal)', marginBottom: '16px' }}>UPI Payment & Registration Fee</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              These settings appear on the player registration page for UPI QR code and payment instructions.
            </p>
            <form onSubmit={handleUpdateConfig} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">UPI ID (VPA) *</label>
                <input type="text" required placeholder="e.g. pay@upi" value={configForm.upiId} onChange={(e) => setConfigForm({ ...configForm, upiId: e.target.value })} className="premium-input" />
              </div>
              <div>
                <label className="form-label">Registration Fee (&#8377;) *</label>
                <input type="number" required min="1" placeholder="500" value={configForm.regFee} onChange={(e) => setConfigForm({ ...configForm, regFee: e.target.value })} className="premium-input" />
              </div>
              <div>
                <label className="form-label">Payee Name (shown in UPI app)</label>
                <input type="text" required placeholder="JCI Premier League" value={configForm.payeeName} onChange={(e) => setConfigForm({ ...configForm, payeeName: e.target.value })} className="premium-input" />
              </div>

              {configForm.upiId && (
                <div className="upi-qr-block" style={{ marginTop: '8px', padding: '16px', background: 'rgba(7, 11, 25, 0.5)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Preview — QR shown on registration page</p>
                  <div className="upi-qr-frame">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${configForm.upiId}&pn=${encodeURIComponent(configForm.payeeName || 'JCI Premier League')}&am=${configForm.regFee || '500'}&cu=INR&tn=FCL%20Registration`)}`}
                      alt="UPI QR preview"
                      width={160}
                      height={160}
                      style={{ width: '160px', height: '160px' }}
                    />
                  </div>
                  <p style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-gold)' }}>{configForm.upiId}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Amount: &#8377;{configForm.regFee || '500'}</p>
                </div>
              )}

              <button type="submit" className="premium-button" style={{ justifyContent: 'center' }}>Save UPI Settings</button>
            </form>
          </div>

          <div className="premium-card" style={{ border: '1px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)', marginBottom: '12px' }}>
              <AlertTriangle size={28} />
              <h2 style={{ fontSize: '18px', fontWeight: '800' }}>System Reset</h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              Clears all players, bids, team rosters, and ads. Re-initializes franchise teams with default 100,000 point purses.
            </p>
            <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '8px', border: '1px solid var(--card-border)', marginBottom: '16px' }}>
              <label className="form-label">Type <strong>RESET</strong> to confirm:</label>
              <input type="text" placeholder="RESET" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} className="premium-input" style={{ marginTop: '8px' }} />
            </div>
            <button onClick={handleResetSystem} className="premium-button" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', justifyContent: 'center', width: '100%' }}>
              <RotateCcw size={18} /> Reset Database
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentCard({ player, onApprove, showActions }) {
  const statusColor = player.paymentStatus === 'Approved' ? 'var(--success)' : 'var(--accent-gold)';
  return (
    <div style={{ border: '1px solid var(--card-border)', borderRadius: '10px', padding: '16px', background: 'rgba(7, 11, 25, 0.4)', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: '220px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {player.photoUrl ? <img src={player.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Users size={20} color="var(--text-secondary)" />}
        </div>
        <div>
          <p style={{ fontWeight: '700', fontSize: '15px' }}>{player.fullName}</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{player.mobileNumber} &bull; {player.email || 'No email'}</p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{player.organization}</p>
        </div>
      </div>
      <div style={{ minWidth: '160px' }}>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Payment proof</p>
        {player.paymentScreenshot ? (
          <a href={player.paymentScreenshot} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--accent-gold)', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <img src={player.paymentScreenshot} alt="Receipt" style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--accent-gold)' }} />
            View receipt ↗
          </a>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Not uploaded</span>
        )}
      </div>
      <div style={{ textAlign: 'center', minWidth: '100px' }}>
        <span className="badge" style={{ fontSize: '10px', background: `${statusColor}22`, color: statusColor }}>{player.paymentStatus}</span>
        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '4px' }}>{player.status}</p>
      </div>
      {showActions && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onApprove(player.id, 'approve')} className="premium-button" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '8px 14px', fontSize: '12px' }}>
            <Check size={14} /> Approve
          </button>
          <button onClick={() => onApprove(player.id, 'reject')} className="premium-button-secondary" style={{ border: '1px solid var(--danger)', color: 'var(--danger)', padding: '8px 14px', fontSize: '12px' }}>
            <X size={14} /> Reject
          </button>
        </div>
      )}
    </div>
  );
}

function ArrowRightIcon() {
  return <ArrowRight size={15} />;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}

function paymentTone(status) {
  return status === 'Approved' ? 'approved' : 'pending';
}

function QueuePlayer({ player, onApprove }) {
  return (
    <div className="admin-queue-player">
      <div className="admin-player-avatar">
        {player.photoUrl ? <img src={player.photoUrl} alt="" /> : <UserRound size={19} />}
      </div>
      <div className="admin-queue-name"><b>{player.fullName}</b><span>{player.preferredRole} · {player.organization}</span></div>
      <div className="admin-queue-reference"><span>Payment proof</span><b>{player.paymentScreenshot ? 'Screenshot uploaded' : 'Not supplied'}</b></div>
      <button onClick={() => onApprove(player.id, 'approve')} className="admin-approve-button"><Check size={15} /> Approve</button>
    </div>
  );
}

function IntakeRow({ player }) {
  return (
    <div className="admin-intake-row">
      <span className="admin-intake-player"><i>{player.fullName?.slice(0, 1)}</i><b>{player.fullName}</b></span>
      <span>{player.preferredRole} · {player.organization}</span>
      <span><em className={`admin-payment-chip ${paymentTone(player.paymentStatus)}`}>{player.paymentStatus}</em></span>
      <span>{formatDate(player.createdAt)}</span>
    </div>
  );
}

function EmptyState({ title, text }) {
  return <div className="admin-empty-state"><Users size={25} /><b>{title}</b><span>{text}</span></div>;
}

function PlayerRecord({ player, onApprove, onDelete }) {
  const canReview = player.paymentStatus === 'Pending';
  return (
    <article className="admin-player-record">
      <div className="admin-record-primary">
        <div className="admin-player-avatar admin-record-photo">
          {player.photoUrl ? <img src={player.photoUrl} alt={`${player.fullName}`} /> : <UserRound size={23} />}
        </div>
        <div><h3>{player.fullName}</h3><p>{player.preferredRole} · {player.organization}</p></div>
      </div>
      <div className="admin-record-statuses">
        <span className={`admin-payment-chip ${paymentTone(player.paymentStatus)}`}>{player.paymentStatus === 'Approved' ? 'Payment completed' : 'Payment pending'}</span>
        <span className="admin-player-status">{player.status}</span>
      </div>
      <div className="admin-record-contact"><span>{player.mobileNumber}</span><span>{player.email || 'No email supplied'}</span></div>
      <div className="admin-record-actions">
        {canReview && <><button onClick={() => onApprove(player.id, 'approve')} className="admin-approve-button"><Check size={15} /> Approve</button><button onClick={() => onApprove(player.id, 'reject')} className="admin-reject-button"><X size={15} /> Reject</button></>}
        {player.paymentScreenshot && <a href={player.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="admin-receipt-link"><Eye size={15} /> Receipt</a>}
        {onDelete && (
          <button
            onClick={() => onDelete(player.id, player.fullName)}
            className="premium-button-secondary"
            style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid var(--danger)', color: 'var(--danger)' }}
            title="Delete player permanently"
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
      </div>
      <details className="admin-record-details">
        <summary>View full registration details <ArrowRight size={15} /></summary>
        <div className="admin-detail-grid">
          <Detail label="Full name" value={player.fullName} />
          <Detail label="Mobile number" value={player.mobileNumber} />
          <Detail label="Email" value={player.email || 'Not supplied'} />
          <Detail label="Organisation" value={player.organization} />
          <Detail label="Gender" value={player.gender} />
          <Detail label="Age group" value={player.ageGroup} />
          <Detail label="Playing role" value={player.preferredRole} />
          <Detail label="Experience" value={player.experience} />
          <Detail label="Jersey size" value={player.jerseySize} />
          <Detail label="Payment state" value={player.paymentStatus} />
          <Detail label="Payment proof" value={player.paymentScreenshot ? 'Screenshot uploaded' : 'Not supplied'} />
          <Detail label="Registered on" value={formatDate(player.createdAt)} />
          <Detail label="Player status" value={player.status} />
          <Detail label="Drafted by" value={player.team?.name || 'Not drafted'} />
          {player.soldPrice != null && <Detail label="Winning bid" value={`${player.soldPrice.toLocaleString()} points`} />}
        </div>
      </details>
    </article>
  );
}

function Detail({ label, value }) {
  return <div><span>{label}</span><b>{value}</b></div>;
}
