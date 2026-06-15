import { useState, useEffect } from 'react';
import { getUsersApi, blockUserApi, unblockUserApi, deleteUserApi, getUserByIdApi } from '../../services/adminService';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  BookOpen
} from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');

  // Profile modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSessions, setUserSessions] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsersApi({ search, status, page, limit: 10 });
      if (res.success) {
        setUsers(res.data);
        setTotal(res.total);
        setPages(res.pages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch candidate list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBlockToggle = async (userId, isCurrentlyBlocked) => {
    setActionLoading(userId);
    try {
      if (isCurrentlyBlocked) {
        await unblockUserApi(userId);
      } else {
        await blockUserApi(userId);
      }
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to delete this candidate? This will permanently remove their entire profile and interview history.')) {
      return;
    }
    setActionLoading(userId);
    try {
      await deleteUserApi(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete candidate');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewProfile = async (userId) => {
    setModalLoading(true);
    try {
      const res = await getUserByIdApi(userId);
      if (res.success) {
        setSelectedUser(res.data.user);
        setUserSessions(res.data.sessions);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch candidate details');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Candidates</h1>
        <p className="text-gray-400 text-sm mt-1">Review active enrollments, check practice activities, or block/remove accounts.</p>
      </div>

      {/* Filters & search bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-xl border border-gray-850">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full glass-input rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none placeholder-gray-600"
          />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="glass-input rounded-xl py-2 px-4 text-sm text-white focus:outline-none w-full md:w-auto cursor-pointer"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="glass-panel rounded-2xl border border-gray-850 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/20 text-gray-500 text-xs font-bold uppercase">
                <th className="py-4 px-6">Name / Email</th>
                <th className="py-4 px-6">Education</th>
                <th className="py-4 px-6">Sign-In Provider</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((cand) => (
                  <tr key={cand._id} className="hover:bg-gray-900/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{cand.name}</div>
                      <div className="text-xs text-gray-500">{cand.email}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {cand.education || <span className="text-gray-600 text-xs italic">Not specified</span>}
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-medium">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-800/40 border border-gray-700/35">
                        {cand.authProvider || 'local'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                          cand.isBlocked
                            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                            : 'bg-green-500/10 border border-green-500/20 text-green-400'
                        }`}
                      >
                        {cand.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewProfile(cand._id)}
                          className="p-1.5 rounded-lg border border-gray-800 bg-gray-900/40 hover:bg-gray-800/60 hover:text-white transition-all cursor-pointer text-gray-400"
                          title="View Profile"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleBlockToggle(cand._id, cand.isBlocked)}
                          disabled={actionLoading === cand._id}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            cand.isBlocked
                              ? 'border-green-500/10 bg-green-500/5 text-green-400 hover:bg-green-500/15'
                              : 'border-amber-500/10 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15'
                          }`}
                          title={cand.isBlocked ? 'Unblock Candidate' : 'Block Candidate'}
                        >
                          {cand.isBlocked ? <UserCheck className="w-4.5 h-4.5" /> : <UserX className="w-4.5 h-4.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(cand._id)}
                          disabled={actionLoading === cand._id}
                          className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition-all cursor-pointer"
                          title="Delete Account"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    No candidates match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-850">
            <span className="text-xs text-gray-500">
              Showing page {page} of {pages} ({total} total candidates)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-2 border border-gray-800 bg-gray-900/40 hover:bg-gray-850 rounded-lg text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(p + 1, pages))}
                disabled={page === pages}
                className="p-2 border border-gray-800 bg-gray-900/40 hover:bg-gray-850 rounded-lg text-gray-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Profile Modal overlay */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl glass-panel border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-zoomIn flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-850 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5.5 h-5.5 text-red-500" />
                Candidate Dossier
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg border border-gray-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Profile Details Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-4 rounded-xl border border-gray-850">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Full Name</div>
                  <div className="font-bold text-white">{selectedUser.name}</div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-gray-850">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Email Address</div>
                  <div className="font-bold text-white">{selectedUser.email}</div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-gray-850">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Registration Date</div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-red-500" />
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="glass-card p-4 rounded-xl border border-gray-850">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">Academic Status</div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-4.5 h-4.5 text-red-500" />
                    {selectedUser.education || 'High School'}
                  </div>
                </div>
              </div>

              {/* Sessions Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm uppercase tracking-wider text-gray-400">Recent Interview Preparation Sessions</h4>
                <div className="overflow-hidden border border-gray-850 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-900/40 border-b border-gray-850 text-gray-500 uppercase font-bold">
                        <th className="py-2.5 px-4">Organization</th>
                        <th className="py-2.5 px-4">Position</th>
                        <th className="py-2.5 px-4 text-right">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-850/50">
                      {userSessions.length > 0 ? (
                        userSessions.map((session) => (
                          <tr key={session._id} className="hover:bg-gray-800/10">
                            <td className="py-3 px-4 font-semibold text-white">{session.organization?.name}</td>
                            <td className="py-3 px-4 text-gray-300">{session.position?.name || 'General Practice'}</td>
                            <td className="py-3 px-4 text-right text-gray-400">
                              {new Date(session.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-6 text-center text-gray-500 italic">
                            No preparation attempts recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
