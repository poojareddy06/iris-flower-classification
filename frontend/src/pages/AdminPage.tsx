import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { User } from '../types';
import {
  ShieldAlert,
  Users,
  Database,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const [uList, sData, lData] = await Promise.all([
          api.admin.getUsers().catch(() => []),
          api.admin.getStats().catch(() => null),
          api.admin.getLogs().catch(() => []),
        ]);
        setUsers(uList);
        setStats(sData);
        setLogs(lData);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-iris-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p>Loading administration console...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white">Admin Management Console</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            System overview, registered user accounts, model versions, and audit activity logs.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Privileged Console
        </span>
      </div>

      {/* Global Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Total Users</span>
            <p className="text-3xl font-black text-white mt-1">{stats.total_users}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Datasets Loaded</span>
            <p className="text-3xl font-black text-blue-400 mt-1">{stats.total_datasets}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Trained Models</span>
            <p className="text-3xl font-black text-iris-300 mt-1">{stats.total_models}</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500">Inferences Run</span>
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats.total_predictions}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Users List & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Registered Users */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Users className="w-4 h-4 text-iris-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Registered Accounts ({users.length})
            </h3>
          </div>

          {users.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-semibold text-white">{u.full_name}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No registered user accounts found.
            </div>
          )}
        </div>

        {/* Audit Activity Logs */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              System Activity & Audit Logs
            </h3>
          </div>

          {logs.length > 0 ? (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <div>
                      <p className="text-slate-200 font-medium">{log.message}</p>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {log.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              No system activity logs recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
