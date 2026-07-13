import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, ArrowRight, Loader2, Sparkles, UserPlus, LogIn } from 'lucide-react';

interface AuthFlowProps {
  onSuccess: (user: any) => void;
}

export default function AuthFlow({ onSuccess }: AuthFlowProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/google/url');
      if (!res.ok) throw new Error('Failed to get auth URL');
      const { url } = await res.json();
      
      const authWindow = window.open(url, 'google_oauth', 'width=500,height=600');
      if (!authWindow) {
        setError('Popup blocked. Please allow popups for this site.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Failed to initiate Google login');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (!event.origin.endsWith('.run.app') && !event.origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.user) {
        onSuccess(event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        onSuccess(data);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50/50 p-6 overflow-hidden">
      {/* Soft Blurred Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/20 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-100/20 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] space-y-10 z-10"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <img 
                src="https://res.cloudinary.com/dwthgcx5j/image/upload/v1783888198/square-crop_tlegc3.png" 
                alt="Atmos Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-[26px] font-semibold text-gray-900 tracking-tight">
              {mode === 'login' ? 'Sign in to Atmos' : 'Create your account'}
            </h1>
            <p className="text-[15px] text-gray-500">
              {mode === 'login' ? 'Sign in to Atmos to access your account' : 'Join Atmos for a private, intelligent search experience'}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 bg-gray-100/80 text-gray-700 rounded-full font-medium flex items-center justify-center gap-2.5 hover:bg-gray-200/60 transition-all active:scale-[0.98] outline-none disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/60"></div>
            </div>
            <span className="relative px-4 bg-[#f9fafb] text-[13px] text-gray-400">or</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-gray-900 ml-4">Email</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-6 py-3.5 bg-white border border-gray-200 rounded-full outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-4">
              <label className="text-[13px] font-medium text-gray-900">Password</label>
              {mode === 'login' && (
                <button type="button" className="text-[13px] text-gray-400 hover:text-gray-900 transition-colors">
                  Forgot password?
                </button>
              )}
            </div>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-6 py-3.5 bg-white border border-gray-200 rounded-full outline-none focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500 font-medium px-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              mode === 'login' ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>
      </div>

        <div className="text-center">
          <button 
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-[14px] text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </motion.div>
      
      <div className="absolute bottom-8 text-[12px] text-gray-400">
        Privacy Policy
      </div>
    </div>
  );
}
