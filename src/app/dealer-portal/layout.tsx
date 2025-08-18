'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  company_name?: string;
}

interface NavStats {
  new_leads: number;
}

export default function DealerPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navStats, setNavStats] = useState<NavStats>({ new_leads: 0 });

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Fetch nav stats after auth is confirmed
    if (user) {
      fetchNavStats();
      // Refresh stats every 30 seconds
      const interval = setInterval(fetchNavStats, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    const root = document.documentElement;
    if (sidebarOpen) {
      root.classList.add('overflow-hidden');
    } else {
      root.classList.remove('overflow-hidden');
    }
    return () => {
      root.classList.remove('overflow-hidden');
    };
  }, [sidebarOpen]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login?type=business');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'business_owner' && data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(data.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login?type=business');
    } finally {
      setLoading(false);
    }
  };

  const fetchNavStats = async () => {
    try {
      const response = await fetch('/api/dealer-portal/stats');
      if (response.ok) {
        const data = await response.json();
        console.log('Nav stats fetched:', data); // Debug log
        setNavStats({ new_leads: data.new_leads || 0 });
      }
    } catch (error) {
      console.error('Failed to fetch nav stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login?type=business');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dealer-portal/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/dealer-portal/leads', icon: Users },
    { name: 'Business Profile', href: '/dealer-portal/profile', icon: Building2 },
    { name: 'Advertise & Feature', href: '/dealer-portal/advertise', icon: Megaphone },
    { name: 'Account Settings', href: '/dealer-portal/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/5">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="dealer-sidebar"
        aria-hidden={!sidebarOpen}
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-primary text-primary-foreground shadow-lg transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary/30">
          <div>
            <h2 className="text-xl font-bold text-primary-foreground">Dealer Portal</h2>
            {user?.company_name && (
              <p className="text-sm text-primary-foreground/80">{user.company_name}</p>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-primary-foreground/80 hover:text-primary-foreground"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                             (item.name === 'Dashboard' && pathname === '/dealer-portal');
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : 'text-primary-foreground/90 hover:bg-primary/90'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="flex-1">{item.name}</span>
                    {item.name === 'Leads' && navStats.new_leads > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {navStats.new_leads}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-primary/30">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-primary-foreground/90 hover:bg-primary/90 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-secondary text-secondary-foreground shadow-sm border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-secondary-foreground/80 hover:text-secondary-foreground"
              aria-label="Open menu"
              aria-controls="dealer-sidebar"
              aria-expanded={sidebarOpen}
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <button className="relative text-secondary-foreground/80 hover:text-secondary-foreground">
                <Bell className="h-6 w-6" />
                {navStats.new_leads > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                    {navStats.new_leads}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-secondary-foreground/80">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
}