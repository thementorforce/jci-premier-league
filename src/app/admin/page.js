'use client';

import { useState, useEffect } from 'react';
import { Play, Check, X, Shield, Plus, Trash2, RotateCcw, AlertTriangle, Users, Award, ShieldAlert } from 'lucide-react';

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('bidding');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: null, text: '' });
  
  // Data State
  const [activePlayer, setActivePlayer] = useState(null);
  const [draftPool, setDraftPool] = useState([]);
  const [teams, setTeams] = useState([]);
  const [ads, setAds] = useState([]);
  const [pendingPlayers, setPendingPlayers] = useState([]);
  
  // Forms State
  const [bidForm, setBidForm] = useState({ teamId: '', amount: '' });
  const [adForm, setAdForm] = useState({ title: '', imageUrl: '', targetUrl: '', position: 'SIDEBAR' });
  const [setupKey, setSetupKey] = useState('');

  const showStatus = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: null, text: '' }), 5000);
  };

  const fetchConsoleData = async () => {
    try {
      const res = await fetch('/api/auction/status');
      if (res.ok) {
        const data = await res.json();
        setActivePlayer(data.activePlayer);
        setDraftPool(data.draftPool);
        setTeams(data.teams);
      }
      
      const adsRes = await fetch('/api/admin/ads');
      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setAds(adsData);
      }

      const pendingRes = await fetch('/api/admin/approve-player');
      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        setPendingPlayers(pendingData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsoleData();
    const interval = setInterval(fetchConsoleData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartBidding = async (playerId) => {
    try {
      const res = await fetch('/api/admin/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', `Active bidding started for ${data.player.fullName}`);
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Failed to communicate with server');
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!activePlayer) return;
    try {
      const res = await fetch('/api/admin/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: activePlayer.id,
          teamId: bidForm.teamId,
          amount: parseInt(bidForm.amount, 10)
        })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Bid placed successfully!');
        setBidForm({ ...bidForm, amount: '' }); // reset amount
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Failed to place bid');
    }
  };

  const handleCompleteSale = async () => {
    if (!activePlayer) return;
    try {
      const res = await fetch('/api/admin/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayer.id })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message || 'Player sold successfully!');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Failed to record sale');
    }
  };

  const handleMarkUnsold = async () => {
    if (!activePlayer) return;
    try {
      const res = await fetch('/api/admin/unsold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: activePlayer.id })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', 'Player marked as Unsold.');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Failed to mark unsold');
    }
  };

  const handleApprovePlayer = async (playerId, action) => {
    try {
      const res = await fetch('/api/admin/approve-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', action === 'approve' ? 'Player payment approved & added to draft!' : 'Player registration deleted.');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Server connection error');
    }
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adForm)
      });
      if (res.ok) {
        showStatus('success', 'Ad added successfully!');
        setAdForm({ title: '', imageUrl: '', targetUrl: '', position: 'SIDEBAR' });
        fetchConsoleData();
      } else {
        const data = await res.json();
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Failed to create ad');
    }
  };

  const handleDeleteAd = async (id) => {
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showStatus('success', 'Ad deleted successfully!');
        fetchConsoleData();
      } else {
        showStatus('error', 'Failed to delete ad');
      }
    } catch (e) {
      showStatus('error', 'Server error during deletion');
    }
  };

  const handleResetSystem = async () => {
    if (setupKey !== 'RESET') {
      showStatus('error', "Type 'RESET' in the confirmation box to run database initialization.");
      return;
    }
    if (!confirm('Are you sure you want to reset all players, bids, and teams? This action is destructive.')) return;
    
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_all' })
      });
      const data = await res.json();
      if (res.ok) {
        showStatus('success', data.message);
        setSetupKey('');
        fetchConsoleData();
      } else {
        showStatus('error', data.error);
      }
    } catch (e) {
      showStatus('error', 'Failed to reset database');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title */}
      <div>
        <h1 className="gold-gradient-text" style={{ fontSize: '36px', fontWeight: '800' }}>🛠️ Admin Bidding Console</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Control the live auction flow, approve UPI payments, manage ads, and reset database</p>
      </div>

      {/* Dynamic Status Banner */}
      {statusMessage.text && (
        <div style={{
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
          color: 'var(--text-primary)',
          padding: '12px 20px',
          borderRadius: '8px',
          fontWeight: '600',
          fontSize: '14px'
        }}>
          {statusMessage.text}
        </div>
      )}

      {/* Console Tab Links */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('bidding')} 
          className={activeTab === 'bidding' ? 'premium-button' : 'premium-button-secondary'}
          style={{ borderRadius: '8px', padding: '8px 20px', fontSize: '14px' }}
        >
          Auction Control
        </button>
        <button 
          onClick={() => setActiveTab('approvals')} 
          className={activeTab === 'approvals' ? 'premium-button' : 'premium-button-secondary'}
          style={{ borderRadius: '8px', padding: '8px 20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          Pending Payments ({pendingPlayers.length})
        </button>
        <button 
          onClick={() => setActiveTab('ads')} 
          className={activeTab === 'ads' ? 'premium-button' : 'premium-button-secondary'}
          style={{ borderRadius: '8px', padding: '8px 20px', fontSize: '14px' }}
        >
          Sponsor Banners
        </button>
        <button 
          onClick={() => setActiveTab('system')} 
          className={activeTab === 'system' ? 'premium-button' : 'premium-button-secondary'}
          style={{ borderRadius: '8px', padding: '8px 20px', fontSize: '14px' }}
        >
          System Setup
        </button>
      </div>

      {/* Tab: Bidding Console */}
      {activeTab === 'bidding' && (
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '32px' }}>
          
          {/* Active Player Live Bid Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="premium-card">
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-teal)' }}>Active Bid Desk</h2>
              
              {activePlayer ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {activePlayer.photoUrl ? (
                        <img src={activePlayer.photoUrl} alt="active" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '24px' }}>👤</span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{activePlayer.fullName}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{activePlayer.preferredRole} • {activePlayer.organization}</p>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Current Bid Holder</span>
                      <p style={{ fontWeight: '700', color: 'var(--accent-gold)' }}>{activePlayer.highestBidder}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Current Amount</span>
                      <p style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>{activePlayer.currentBid.toLocaleString()} pts</p>
                    </div>
                  </div>

                  {/* Add Bid Form */}
                  <form onSubmit={handlePlaceBid} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: '2', minWidth: '180px' }}>
                      <label className="form-label">Bidding Franchise</label>
                      <select 
                        required
                        value={bidForm.teamId} 
                        onChange={(e) => setBidForm({ ...bidForm, teamId: e.target.value })}
                        className="premium-select"
                      >
                        <option value="">Select Team</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.name} (Purse: {(t.pointsPurse - t.pointsSpent).toLocaleString()})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: '1', minWidth: '100px' }}>
                      <label className="form-label">Points Bid</label>
                      <input 
                        type="number" 
                        required
                        placeholder="Bid" 
                        value={bidForm.amount} 
                        onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                        className="premium-input"
                      />
                    </div>
                    <button type="submit" className="premium-button" style={{ height: '48px', padding: '0 24px' }}>
                      Place
                    </button>
                  </form>

                  {/* Bidding Completion Buttons */}
                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <button 
                      onClick={handleCompleteSale} 
                      className="premium-button" 
                      style={{ flex: '1', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)' }}
                    >
                      <Check size={18} /> Record Sold
                    </button>
                    <button 
                      onClick={handleMarkUnsold} 
                      className="premium-button-secondary" 
                      style={{ flex: '1', border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)' }}
                    >
                      <X size={18} /> Mark Unsold
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px' }}>
                  No active player selected. Select a player from the Draft Pool to begin.
                </div>
              )}
            </div>

            {/* Team Standing quick snapshot */}
            <div className="premium-card">
              <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>💰 Franchise Purse Status</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {teams.map(t => (
                  <div key={t.id} style={{ background: 'rgba(7, 11, 25, 0.6)', border: '1px solid var(--card-border)', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ fontWeight: '700', fontSize: '14px' }}>{t.name}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Spent: {t.pointsSpent.toLocaleString()}</p>
                    <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-teal)', marginTop: '4px' }}>Purse: {(t.pointsPurse - t.pointsSpent).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Draft Pool Selector */}
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-gold)' }}>📋 Draft Pool ({draftPool.length})</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Select a registered player to start bidding in the live auction arena:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {draftPool.length === 0 ? (
                <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>No registered players waiting to be drafted.</p>
              ) : (
                draftPool.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(7, 11, 25, 0.4)', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px' }}>{p.fullName}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.preferredRole} • {p.organization}</p>
                    </div>
                    <button 
                      onClick={() => handleStartBidding(p.id)}
                      className="premium-button-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Play size={12} /> Start Bid
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab: Pending Payments Approval */}
      {activeTab === 'approvals' && (
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-gold)' }}>💳 Pending Player Registrations & Payments ({pendingPlayers.length})</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Verify the UPI UTR Transaction Reference ID against your bank statement before approving players for the draft.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingPlayers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                No pending registrations waiting for verification.
              </div>
            ) : (
              pendingPlayers.map(p => (
                <div key={p.id} style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '20px', background: 'rgba(7, 11, 25, 0.4)', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  
                  {/* Photo & Profile */}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', minWidth: '250px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-tertiary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt="active" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '24px' }}>👤</span>
                      )}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{p.fullName}</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Role: <strong>{p.preferredRole}</strong></p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Mobile: {p.mobileNumber} • Org: {p.organization}</p>
                    </div>
                  </div>

                  {/* Payment Verification Data */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '200px' }}>
                    <p style={{ fontSize: '13px' }}>UTR Transaction Ref ID:</p>
                    <p style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--accent-teal)', fontSize: '16px', letterSpacing: '0.05em' }}>{p.transactionId}</p>
                    
                    {p.paymentScreenshot && (
                      <a 
                        href={p.paymentScreenshot} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="premium-button-secondary" 
                        style={{ padding: '4px 10px', fontSize: '11px', alignSelf: 'flex-start', marginTop: '4px' }}
                      >
                        🖼️ View Receipt Screenshot
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleApprovePlayer(p.id, 'approve')}
                      className="premium-button"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '10px 18px', fontSize: '13px' }}
                    >
                      <Check size={16} /> Approve Payment
                    </button>
                    <button 
                      onClick={() => handleApprovePlayer(p.id, 'reject')}
                      className="premium-button-secondary"
                      style={{ border: '1px solid var(--danger)', color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.05)', padding: '10px 18px', fontSize: '13px' }}
                    >
                      <X size={16} /> Reject / Delete
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Sponsor Banners */}
      {activeTab === 'ads' && (
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: '32px' }}>
          
          {/* Add Sponsor Ad form */}
          <div className="premium-card">
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: 'var(--accent-teal)' }}>Add Sponsor Placement</h2>
            <form onSubmit={handleAddAd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Sponsor Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Decathlon Tumkur" 
                  value={adForm.title} 
                  onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                  className="premium-input"
                />
              </div>
              <div>
                <label className="form-label">Image URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://example.com/banner.jpg" 
                  value={adForm.imageUrl} 
                  onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                  className="premium-input"
                />
              </div>
              <div>
                <label className="form-label">Target Link URL</label>
                <input 
                  type="text" 
                  placeholder="https://target-sponsor.com" 
                  value={adForm.targetUrl} 
                  onChange={(e) => setAdForm({ ...adForm, targetUrl: e.target.value })}
                  className="premium-input"
                />
              </div>
              <div>
                <label className="form-label">Banner Position</label>
                <select 
                  value={adForm.position} 
                  onChange={(e) => setAdForm({ ...adForm, position: e.target.value })}
                  className="premium-select"
                >
                  <option value="TOP_BANNER">Top Horizontal Banner (Main page)</option>
                  <option value="SIDEBAR">Sidebar Banner (Teams page)</option>
                </select>
              </div>
              <button type="submit" className="premium-button" style={{ marginTop: '8px', justifyContent: 'center' }}>
                <Plus size={18} /> Add Advertisement
              </button>
            </form>
          </div>

          {/* Current Sponsor Placements */}
          <div className="premium-card">
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Active Ad Banner Placements ({ads.length})</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {ads.length === 0 ? (
                <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', fontSize: '14px' }}>No sponsorships configured.</p>
              ) : (
                ads.map(ad => (
                  <div key={ad.id} style={{ display: 'flex', gap: '16px', background: 'rgba(7, 11, 25, 0.4)', border: '1px solid var(--card-border)', padding: '12px', borderRadius: '12px', alignItems: 'center' }}>
                    <img src={ad.imageUrl} alt={ad.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: '1' }}>
                      <p style={{ fontWeight: '700', fontSize: '14px' }}>{ad.title}</p>
                      <span className="badge badge-registered" style={{ fontSize: '9px', marginTop: '4px' }}>{ad.position}</span>
                    </div>
                    <button 
                      onClick={() => handleDeleteAd(ad.id)}
                      className="premium-button-secondary"
                      style={{ padding: '8px', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.05)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* Tab: System Settings */}
      {activeTab === 'system' && (
        <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)' }}>
              <AlertTriangle size={32} />
              <h2 style={{ fontSize: '20px', fontWeight: '800' }}>System Reinitialization Area</h2>
            </div>
            
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Resetting the system will clear all active player registrations, bid histories, team rosters, and ads. It will immediately re-initialize the 4 main Tumkur franchise teams (Tumkur Titans, Metro Mavericks, Prerana Panthers, JCI Warriors) with default 100,000 points purses.
            </p>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
              <label className="form-label" style={{ color: 'var(--text-primary)' }}>Type <strong>RESET</strong> to confirm:</label>
              <input 
                type="text" 
                placeholder="RESET" 
                value={setupKey} 
                onChange={(e) => setSetupKey(e.target.value)} 
                className="premium-input"
                style={{ marginTop: '8px' }}
              />
            </div>

            <button 
              onClick={handleResetSystem} 
              className="premium-button" 
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)', justifyContent: 'center' }}
            >
              <RotateCcw size={18} /> Reset Database & Initialize Teams
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
