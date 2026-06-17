import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStatsApi } from '../../services/adminService';
import {
  Users,
  Building2,
  HelpCircle,
  Video,
  UserCheck,
  UserX,
  Plus,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getStatsApi();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Candidates',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20'
    },
    {
      title: 'Active Candidates',
      value: stats?.users?.active || 0,
      icon: UserCheck,
      color: 'from-green-500/10 to-green-500/5 text-green-400 border-green-500/20'
    },
    {
      title: 'Blocked Candidates',
      value: stats?.users?.blocked || 0,
      icon: UserX,
      color: 'from-red-500/10 to-red-500/5 text-red-400 border-red-500/20'
    },
    {
      title: 'Departments',
      value: stats?.departments || 0,
      icon: Building2,
      color: 'from-purple-500/10 to-purple-500/5 text-purple-400 border-purple-500/20'
    },
    {
      title: 'Question Bank',
      value: stats?.questions || 0,
      icon: HelpCircle,
      color: 'from-amber-500/10 to-amber-500/5 text-amber-400 border-amber-500/20'
    },
    {
      title: 'Interview Sessions',
      value: stats?.sessions || 0,
      icon: Video,
      color: 'from-teal-500/10 to-teal-500/5 text-teal-400 border-teal-500/20'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">System Console</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time status of candidates, preparation materials, and analytics.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/questions"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </Link>
          <Link
            to="/admin/upload-book"
            className="flex items-center gap-2 px-4 py-2 border border-gray-800 bg-gray-900/40 hover:bg-gray-900/60 hover:border-gray-700 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-red-500" />
            Upload Book
          </Link>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`glass-panel p-5 rounded-2xl flex flex-col justify-between border bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider opacity-60">{card.title}</span>
                <Icon className="w-5 h-5 opacity-80" />
              </div>
              <div className="text-2xl font-black mt-4 text-white">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent users */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-red-500" />
              Recent Candidates
            </h3>
            <Link
              to="/admin/users"
              className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 transition-all"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs font-bold uppercase">
                  <th className="py-3 px-1">Name / Email</th>
                  <th className="py-3 px-1">Registered</th>
                  <th className="py-3 px-1 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850/50">
                {stats?.recentUsers?.length > 0 ? (
                  stats.recentUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-900/10">
                      <td className="py-3.5 px-1">
                        <div className="font-semibold text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-1 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-1 text-right">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.isBlocked
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                              : 'bg-green-500/10 border border-green-500/20 text-green-400'
                          }`}
                        >
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      No candidates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-850 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-500" />
              Recent Practice Sessions
            </h3>
            <span className="text-xs text-gray-500">Latest activity</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 text-xs font-bold uppercase">
                  <th className="py-3 px-1">Candidate</th>
                  <th className="py-3 px-1">Target Position</th>
                  <th className="py-3 px-1 text-right">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850/50">
                {stats?.recentSessions?.length > 0 ? (
                  stats.recentSessions.map((session) => (
                    <tr key={session._id} className="hover:bg-gray-900/10">
                      <td className="py-3.5 px-1">
                        <div className="font-semibold text-white">{session.user?.name || 'Deleted User'}</div>
                        <div className="text-xs text-gray-500">{session.user?.email || 'N/A'}</div>
                      </td>
                      <td className="py-3.5 px-1">
                        <div className="font-medium text-gray-300">{session.departmentId?.name || 'General Practice'}</div>
                        <div className="text-xs text-gray-500">{session.position ? `${session.subCategory} - ${session.position}` : ''}</div>
                      </td>
                      <td className="py-3.5 px-1 text-right text-gray-400">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-500">
                      No practice sessions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
