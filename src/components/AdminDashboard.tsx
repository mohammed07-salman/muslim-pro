import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Announcement, Dua } from '../types';
import {
  Shield,
  Users,
  Activity,
  Heart,
  BookOpen,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Search,
  Bell,
  RefreshCw,
  Lock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();

  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalBookmarks: number;
    totalTasbih: number;
    totalDuas: number;
    recentLogs: any[];
  } | null>(null);

  const [usersList, setUsersList] = useState<User[]>([]);
  const [duasList, setDuasList] = useState<Dua[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'duas' | 'announcements' | 'logs'>('overview');

  const [userSearch, setUserSearch] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  // New Dua modal state
  const [showAddDuaModal, setShowAddDuaModal] = useState(false);
  const [duaTitle, setDuaTitle] = useState('');
  const [duaCategory, setDuaCategory] = useState<any>('daily');
  const [duaArabic, setDuaArabic] = useState('');
  const [duaTranslit, setDuaTranslit] = useState('');
  const [duaTranslation, setDuaTranslation] = useState('');
  const [duaRef, setDuaRef] = useState('');
  const [duaRepeat, setDuaRepeat] = useState(1);

  // New Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'important'>('normal');

  const fetchAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [resStats, resUsers, resDuas, resAnn] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/duas'),
        fetch('/api/announcements')
      ]);

      if (resStats.ok) setStats(await resStats.json());
      if (resUsers.ok) setUsersList(await resUsers.json());
      if (resDuas.ok) setDuasList(await resDuas.json());
      if (resAnn.ok) setAnnouncements(await resAnn.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleToggleUserStatus = async (targetUser: User) => {
    if (!token) return;
    const newStatus = targetUser.status === 'active' ? 'disabled' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, status: newStatus } : u));
        setMsg(`Status for ${targetUser.email} changed to ${newStatus}`);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserRole = async (targetUser: User) => {
    if (!token) return;
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
        setMsg(`Role for ${targetUser.email} changed to ${newRole}`);
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token || !confirm('Are you sure you want to delete this user? This action is irreversible.')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        setMsg('User successfully deleted');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDua = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/duas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: duaTitle,
          category: duaCategory,
          arabic: duaArabic,
          transliteration: duaTranslit,
          translation: duaTranslation,
          reference: duaRef,
          repeatCount: duaRepeat
        })
      });
      if (res.ok) {
        const created = await res.json();
        setDuasList(prev => [created, ...prev]);
        setShowAddDuaModal(false);
        setDuaTitle('');
        setDuaArabic('');
        setDuaTranslit('');
        setDuaTranslation('');
        setDuaRef('');
        setMsg('Dua published successfully');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDua = async (id: string) => {
    if (!token || !confirm('Delete this Dua?')) return;
    try {
      const res = await fetch(`/api/duas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setDuasList(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          priority: annPriority
        })
      });
      if (res.ok) {
        const created = await res.json();
        setAnnouncements(prev => [created, ...prev]);
        setAnnTitle('');
        setAnnContent('');
        setMsg('Announcement posted to all users');
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md mx-auto space-y-3">
        <Lock className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Access Restricted</h3>
        <p className="text-xs text-slate-500">
          This section requires administrative privileges. Please log in with an administrator account.
        </p>
      </div>
    );
  }

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.city.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>Staff Administration Console</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white">
            Muslim Pro Admin Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage users, religious supplications, global announcements, and system audit logs
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Database</span>
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'overview', label: 'Overview Metrics' },
          { id: 'users', label: `Users (${usersList.length})` },
          { id: 'duas', label: `Islamic Duas (${duasList.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'logs', label: 'Audit Trail' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium">Total Registered Users</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats.totalUsers}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium">Active Accounts</span>
              <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.activeUsers}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium">Quran Bookmarks</span>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {stats.totalBookmarks}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-[11px] text-slate-400 font-medium">Total Tasbih Taps</span>
              <div className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                {stats.totalTasbih.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-400 font-medium">Islamic Duas Loaded</span>
              <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
                {stats.totalDuas}
              </div>
            </div>
          </div>

          {/* Quick System Activity Snippet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Recent System Activity
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {stats.recentLogs.slice(0, 5).map(log => (
                <div key={log.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white mr-2">[{log.action}]</span>
                    <span className="text-slate-500">{log.details || log.performedBy}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* USERS MANAGEMENT TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Registered User Accounts
            </h3>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name, email, city..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                      {u.city}, {u.country}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          u.role === 'admin'
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                        title="Click to toggle role"
                      >
                        {u.role}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                          u.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                        title="Click to toggle status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DUAS MANAGEMENT TAB */}
      {activeTab === 'duas' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Islamic Duas & Content Repository
            </h3>
            <button
              onClick={() => setShowAddDuaModal(true)}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Dua</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {duasList.map(d => (
              <div key={d.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{d.title}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono uppercase">
                      {d.category}
                    </span>
                  </div>
                  <p className="font-arabic text-sm text-slate-700 dark:text-slate-300 mt-1 line-clamp-1">
                    {d.arabic}
                  </p>
                  <p className="text-slate-500 italic mt-0.5 line-clamp-1">
                    "{d.translation}"
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteDua(d.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Delete dua"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Post announcement form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Broadcast App Announcement
            </h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramadan Mubarak!"
                  value={annTitle}
                  onChange={e => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Message Content
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Message to display at the top of the dashboard..."
                  value={annContent}
                  onChange={e => setAnnContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between">
                <select
                  value={annPriority}
                  onChange={e => setAnnPriority(e.target.value as any)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="normal">Normal Priority</option>
                  <option value="important">High Priority (Gold banner)</option>
                </select>

                <button
                  type="submit"
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>

          {/* Current announcements list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Announcements
            </h3>
            {announcements.map(ann => (
              <div key={ann.id} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{ann.title}</span>
                  <p className="text-slate-500 mt-0.5">{ann.content}</p>
                </div>
                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'logs' && stats && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            System Security & Audit Trail
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {stats.recentLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div>
                  <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 mr-2">
                    {log.action}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Triggered by: {log.performedBy}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Dua Modal */}
      {showAddDuaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Dua / Supplication</h3>
            <form onSubmit={handleCreateDua} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={duaTitle}
                  onChange={e => setDuaTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={duaCategory}
                  onChange={e => setDuaCategory(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="daily">Daily Life</option>
                  <option value="morning">Morning Azkar</option>
                  <option value="evening">Evening Azkar</option>
                  <option value="sleeping">Sleep & Waking</option>
                  <option value="prayer">After Prayer</option>
                  <option value="travel">Travel</option>
                  <option value="eating">Eating & Drinking</option>
                  <option value="protection">Protection & Ruqyah</option>
                  <option value="ramadan">Ramadan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Arabic Text</label>
                <textarea
                  required
                  rows={2}
                  dir="rtl"
                  value={duaArabic}
                  onChange={e => setDuaArabic(e.target.value)}
                  className="w-full px-3 py-1.5 font-arabic text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Transliteration</label>
                <input
                  type="text"
                  value={duaTranslit}
                  onChange={e => setDuaTranslit(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">English Translation</label>
                <textarea
                  required
                  rows={2}
                  value={duaTranslation}
                  onChange={e => setDuaTranslation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reference</label>
                  <input
                    type="text"
                    value={duaRef}
                    onChange={e => setDuaRef(e.target.value)}
                    placeholder="e.g. Sahih Muslim"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Repeat Count</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={duaRepeat}
                    onChange={e => setDuaRepeat(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDuaModal(false)}
                  className="px-3 py-1.5 rounded-xl border text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                >
                  Save Dua
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
