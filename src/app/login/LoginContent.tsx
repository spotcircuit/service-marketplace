'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, Shield, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userType = searchParams.get('type') || 'customer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState(userType);

  useEffect(() => {
    // Update selected type if URL param changes
    const type = searchParams.get('type');
    if (type) {
      setSelectedType(type);
    }
  }, [searchParams]);

  const getLoginInfo = () => {
    switch (selectedType) {
      case 'admin':
        return {
          title: 'Admin Login',
          subtitle: 'Access the platform administration dashboard',
          icon: Shield,
          redirectPath: '/admin',
          demoEmail: 'brian@spotcircuit.com',
          demoPassword: 'Admin123!'
        };
      case 'business':
        return {
          title: 'Business Owner Login',
          subtitle: 'Access your dealer portal to manage leads and grow your business',
          icon: Briefcase,
          redirectPath: '/dealer-portal',
          demoEmail: 'business@example.com',
          demoPassword: 'Business123!'
        };
      case 'customer':
      default:
        return {
          title: 'Customer Login',
          subtitle: 'Sign in to request quotes and manage your projects',
          icon: User,
          redirectPath: '/dashboard',
          demoEmail: 'customer@example.com',
          demoPassword: 'Customer123!'
        };
    }
  };

  const loginInfo = getLoginInfo();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect based on user role
      const redirectPath = data.redirect || loginInfo.redirectPath;
      router.push(redirectPath);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail(loginInfo.demoEmail);
    setPassword(loginInfo.demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Login Type Selector */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          <button
            onClick={() => setSelectedType('customer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-sm font-medium ${
              selectedType === 'customer'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="h-4 w-4" />
            Customer
          </button>
          <button
            onClick={() => setSelectedType('business')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-sm font-medium ${
              selectedType === 'business'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Business
          </button>
          <button
            onClick={() => setSelectedType('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors text-sm font-medium ${
              selectedType === 'admin'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin
          </button>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <loginInfo.icon className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {loginInfo.title}
            </h1>
            <p className="text-sm text-gray-600">
              {loginInfo.subtitle}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">{error}</div>
            </div>
          )}

          {/* Demo Credentials Box */}
          {selectedType === 'admin' && (
            <div className="mb-6 p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Demo Credentials</h3>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-sm text-secondary hover:text-secondary/90 underline"
              >
                Use demo admin account
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your email"
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your password"
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : `Sign in as ${selectedType === 'business' ? 'Business Owner' : selectedType === 'admin' ? 'Admin' : 'Customer'}`}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                href={selectedType === 'business' ? '/for-business' : '/signup'}
                className="text-primary hover:text-primary/80 font-medium"
              >
                {selectedType === 'business' ? 'Join as a Pro' : 'Sign up'}
              </Link>
            </p>
          </div>

          {selectedType === 'business' && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary">
                <strong>Business Owners:</strong> If you have an existing listing,{' '}
                <Link href="/claim" className="underline hover:text-primary/90">
                  claim your business
                </Link>{' '}
                to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
