
import React, { useState } from 'react';
import { RoscaCycle } from '../types';
import { LogInIcon, UserIcon, EyeIcon, EyeOffIcon, SunIcon, MoonIcon } from './Icons';

interface LoginPageProps {
  onLogin: (user: { role: 'admin' } | { role: 'member', cycleId: string, id: string }) => void;
  cycles: RoscaCycle[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, cycles, theme, onToggleTheme }) => {
  const [loginType, setLoginType] = useState<'admin' | 'member'>('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Mock password check
    if (password === '12345678') {
      onLogin({ role: 'admin' });
    } else {
      setError('Invalid password.');
    }
  };

  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedCycleId && selectedMemberId) {
      onLogin({ role: 'member', cycleId: selectedCycleId, id: selectedMemberId });
    } else {
      setError('Please select your cycle and name.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 p-4 relative">
      <div className="absolute top-4 right-4">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
          </button>
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent py-1">
                Helping Hand Cycles
            </h1>
            <p className="text-slate-500 dark:text-slate-400">Please sign in to continue</p>
        </div>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-white/50 dark:border-slate-700/50">
          <div className="mb-6">
            <div className="flex border-b border-slate-300 dark:border-slate-600" role="tablist" aria-label="Login type">
              <button
                id="admin-tab"
                role="tab"
                aria-selected={loginType === 'admin'}
                aria-controls="admin-panel"
                onClick={() => { setLoginType('admin'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${loginType === 'admin' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Admin Login
              </button>
              <button
                id="member-tab"
                role="tab"
                aria-selected={loginType === 'member'}
                aria-controls="member-panel"
                onClick={() => { setLoginType('member'); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${loginType === 'member' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Member Login
              </button>
            </div>
          </div>

          {loginType === 'admin' ? (
            <form onSubmit={handleAdminLogin} id="admin-panel" role="tabpanel" tabIndex={0} aria-labelledby="admin-tab">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="admin-password">
                  Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 pr-10 dark:text-white"
                    placeholder="••••••••"
                    required
                    aria-required="true"
                    aria-invalid={!!error}
                    aria-describedby={error ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="w-5 h-5"/> : <EyeIcon className="w-5 h-5"/>}
                  </button>
                </div>
              </div>
              {error && <p id="password-error" className="text-red-500 text-sm mb-4" role="alert">{error}</p>}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-500"
              >
                <LogInIcon className="w-5 h-5" />
                Sign In as Admin
              </button>
            </form>
          ) : (
            <form onSubmit={handleMemberLogin} id="member-panel" role="tabpanel" tabIndex={0} aria-labelledby="member-tab">
                <div className="mb-4">
                    <label htmlFor="cycle-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Select Your Cycle
                    </label>
                    <select
                        id="cycle-select"
                        value={selectedCycleId}
                        onChange={(e) => {
                            setSelectedCycleId(e.target.value);
                            setSelectedMemberId('');
                        }}
                        className="block w-full px-3 py-2 bg-sky-100 dark:bg-slate-700 dark:text-white border border-sky-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        required
                        aria-required="true"
                        aria-invalid={!!(error && !selectedCycleId)}
                        aria-describedby={error ? 'member-error' : undefined}
                    >
                        <option value="">-- Select a cycle --</option>
                        {cycles.map(cycle => (
                            <option key={cycle.id} value={cycle.id}>{cycle.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="member-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Select Your Name
                    </label>
                    <select
                        id="member-select"
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        disabled={!selectedCycleId}
                        className="block w-full px-3 py-2 bg-sky-100 dark:bg-slate-700 dark:text-white border border-sky-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:text-slate-400"
                        required
                        aria-required="true"
                        aria-invalid={!!(error && !selectedMemberId)}
                        aria-describedby={error ? 'member-error' : undefined}
                    >
                        <option value="">-- Please select --</option>
                        {selectedCycleId &&
                            cycles.find(c => c.id === selectedCycleId)?.members.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                            ))
                        }
                    </select>
                </div>
                {error && <p id="member-error" className="text-red-500 text-sm mb-4" role="alert">{error}</p>}
                <button
                    type="submit"
                    disabled={!selectedMemberId}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                    <UserIcon className="w-5 h-5" />
                    Sign In as Member
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
