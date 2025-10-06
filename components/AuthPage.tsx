import React, { useState, FormEvent, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from './icons/LoadingSpinner';

const OwlLogo: React.FC = () => (
    <div className="flex items-center gap-1.5 text-[#272458]">
        <span className="text-4xl font-extrabold tracking-tighter">Owl</span>
        <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[#f1b434]"></div>
            <div className="w-4 h-4 rounded-full bg-[#00a4d7]"></div>
        </div>
    </div>
);


const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      // On success, App component will handle redirect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
        <div className="text-center mb-8">
            <OwlLogo />
            <h1 className="text-2xl font-bold text-slate-700 mt-2">
                Collaborative Form Builder
            </h1>
        </div>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex">
          <button
            onClick={() => setIsLogin(true)}
            className={`w-1/2 p-4 font-semibold transition-colors ${isLogin ? 'bg-[#00a4d7] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`w-1/2 p-4 font-semibold transition-colors ${!isLogin ? 'bg-[#00a4d7] text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
          >
            Sign Up
          </button>
        </div>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-slate-500 text-center mb-6">
            {isLogin ? 'Log in to continue to your workspace.' : 'Get started by creating a new account.'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                id="email"
                type="email"
                ref={emailRef}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#00a4d7] focus:border-[#00a4d7] sm:text-sm"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                type="password"
                ref={passwordRef}
                required
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-[#00a4d7] focus:border-[#00a4d7] sm:text-sm"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-[#00a4d7] hover:bg-[#0093c4] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00a4d7] disabled:bg-slate-400 disabled:cursor-wait transition-colors"
            >
              {loading ? <LoadingSpinner className="h-5 w-5 text-white" /> : (isLogin ? 'Login' : 'Sign Up Now')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
