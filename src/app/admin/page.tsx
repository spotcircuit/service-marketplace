"use client";

import { useState, useEffect } from 'react';
import { useConfig } from '@/contexts/ConfigContext';
import { Settings, Palette, Globe, Layout, Save, RefreshCw, Eye, Database, Download, Upload, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const { config, themes, loading, error, updateConfig, applyNicheTemplate, reloadConfig } = useConfig();
  const [activeTab, setActiveTab] = useState('overview');
  const [localConfig, setLocalConfig] = useState<any>(null);
  const [selectedNiche, setSelectedNiche] = useState('general');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (config) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
      setSelectedNiche(config.niche || 'general');
    }
  }, [config]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Layout },
    { id: 'niche', name: 'Niche Selection', icon: Globe },
    { id: 'general', name: 'General Settings', icon: Settings },
    { id: 'hero', name: 'Hero Section', icon: Layout },
    { id: 'services', name: 'Service Categories', icon: Database },
    { id: 'theme', name: 'Theme & Colors', icon: Palette },
    { id: 'export', name: 'Export/Import', icon: Download },
  ];

  const niches = [
    { id: 'general', name: 'General Services', description: 'A flexible template for any service type' },
    { id: 'home-services', name: 'Home Services', description: 'Plumbing, electrical, HVAC, and home repairs' },
    { id: 'healthcare', name: 'Healthcare', description: 'Medical professionals and health services' },
    { id: 'education', name: 'Education & Tutoring', description: 'Teachers, tutors, and educational services' },
    { id: 'dumpster-rental', name: 'Dumpster Rental', description: 'Waste management and equipment rental' },
  ];

  const handleSave = async () => {
    if (!localConfig) return;

    setSaving(true);
    setMessage('');

    try {
      // Prepare configs for database
      const configs = [];

      // General settings
      configs.push({ key: 'site_name', value: localConfig.siteName, category: 'general' });
      configs.push({ key: 'site_tagline', value: localConfig.siteTagline, category: 'general' });
      configs.push({ key: 'contact_email', value: localConfig.contactEmail, category: 'general' });
      configs.push({ key: 'contact_phone', value: localConfig.contactPhone, category: 'general' });

      // Hero settings
      configs.push({ key: 'hero_title', value: localConfig.heroTitle, category: 'hero' });
      configs.push({ key: 'hero_subtitle', value: localConfig.heroSubtitle, category: 'hero' });

      // Theme
      if (localConfig.theme) {
        configs.push({ key: 'primary_color', value: localConfig.theme.primaryColor, category: 'theme' });
        configs.push({ key: 'secondary_color', value: localConfig.theme.secondaryColor, category: 'theme' });
      }

      // Categories
      configs.push({ key: 'categories', value: localConfig.categories, category: 'general' });

      // Save to database
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs })
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      // Also update local config context
      await updateConfig(localConfig);
      setMessage('Configuration saved to database successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyNiche = async (nicheId: string) => {
    setSaving(true);
    setMessage('');

    try {
      await applyNicheTemplate(nicheId);
      setMessage(`Applied ${nicheId} template successfully!`);
      setSelectedNiche(nicheId);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to apply template');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ config: localConfig, themes }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = 'site-configuration.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (imported.config) {
          setLocalConfig(imported.config);
          await updateConfig(imported.config);
          setMessage('Configuration imported successfully!');
        }
      } catch (error) {
        setMessage('Failed to import configuration');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No configuration available</p>
      </div>
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Site Configuration Admin</h1>
              <p className="text-muted-foreground">
                Configure your service marketplace platform without touching code
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Logged in as: {user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
          {message && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-4 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Configuration</h3>
                <Link
                  href="/"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Preview
                </Link>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={reloadConfig}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-card border rounded-lg hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Config
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border p-6">
              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Admin Dashboard</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                      href="/admin/stripe"
                      className="p-6 bg-card border-2 rounded-lg hover:border-primary transition-all"
                    >
                      <h3 className="text-lg font-semibold mb-2">Stripe Configuration</h3>
                      <p className="text-muted-foreground">
                        Configure payment processing and subscription plans
                      </p>
                    </Link>
                    <Link
                      href="/admin/leads"
                      className="p-6 bg-card border-2 rounded-lg hover:border-primary transition-all"
                    >
                      <h3 className="text-lg font-semibold mb-2">Lead Management</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        View and manage customer inquiries, quote requests, and lead status
                      </p>
                      <span className="text-primary font-medium">Manage Leads →</span>
                    </Link>

                    <Link
                      href="/directory"
                      className="p-6 bg-card border-2 rounded-lg hover:border-primary transition-all"
                    >
                      <h3 className="text-lg font-semibold mb-2">Business Directory</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Browse and manage business listings in the directory
                      </p>
                      <span className="text-primary font-medium">View Directory →</span>
                    </Link>

                    <Link
                      href="/claim"
                      className="p-6 bg-card border-2 rounded-lg hover:border-primary transition-all"
                    >
                      <h3 className="text-lg font-semibold mb-2">Business Claims</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Process and verify business ownership claims
                      </p>
                      <span className="text-primary font-medium">View Claims →</span>
                    </Link>

                    <Link
                      href="/for-business"
                      className="p-6 bg-card border-2 rounded-lg hover:border-primary transition-all"
                    >
                      <h3 className="text-lg font-semibold mb-2">Business Packages</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage pricing tiers and featured listing packages
                      </p>
                      <span className="text-primary font-medium">View Packages →</span>
                    </Link>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">Quick Stats</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <div className="text-2xl font-bold">5</div>
                        <div className="text-sm text-muted-foreground">Total Businesses</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-muted-foreground">Featured Listings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">Pending Claims</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-sm text-muted-foreground">New Leads</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg">
                    <h3 className="font-semibold mb-2">Getting Started</h3>
                    <ol className="space-y-2 text-sm">
                      <li>1. Configure your site settings and branding in the tabs above</li>
                      <li>2. Choose a niche template or customize from scratch</li>
                      <li>3. Import business data or add listings manually</li>
                      <li>4. Set up pricing packages for featured listings</li>
                      <li>5. Launch your directory and start generating leads!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Niche Selection */}
              {activeTab === 'niche' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Select Your Niche</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Choose a pre-configured template for your industry or start with a general template
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {niches.map((niche) => (
                      <div
                        key={niche.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedNiche === niche.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedNiche(niche.id)}
                      >
                        <h3 className="font-semibold mb-1">{niche.name}</h3>
                        <p className="text-sm text-muted-foreground">{niche.description}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleApplyNiche(selectedNiche)}
                    disabled={saving}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    Apply {niches.find(n => n.id === selectedNiche)?.name} Template
                  </button>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Note:</strong> Applying a niche template will replace your current configuration with pre-set values optimized for that industry. You can further customize after applying.
                    </p>
                  </div>
                </div>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">General Settings</h2>

                  <div>
                    <label className="block text-sm font-medium mb-2">Business Name</label>
                    <input
                      type="text"
                      value={localConfig.businessName}
                      onChange={(e) => setLocalConfig({...localConfig, businessName: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tagline</label>
                    <input
                      type="text"
                      value={localConfig.tagline}
                      onChange={(e) => setLocalConfig({...localConfig, tagline: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={localConfig.description}
                      onChange={(e) => setLocalConfig({...localConfig, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Service (Singular)</label>
                      <input
                        type="text"
                        value={localConfig.mainService?.singular || ''}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          mainService: {...localConfig.mainService, singular: e.target.value}
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Service (Plural)</label>
                      <input
                        type="text"
                        value={localConfig.mainService?.plural || ''}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          mainService: {...localConfig.mainService, plural: e.target.value}
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Action Word</label>
                      <input
                        type="text"
                        value={localConfig.mainService?.action || ''}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          mainService: {...localConfig.mainService, action: e.target.value}
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hero Section */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Hero Section</h2>

                  <div>
                    <label className="block text-sm font-medium mb-2">Headline</label>
                    <input
                      type="text"
                      value={localConfig.hero?.headline || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        hero: {...localConfig.hero, headline: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subheadline</label>
                    <input
                      type="text"
                      value={localConfig.hero?.subheadline || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        hero: {...localConfig.hero, subheadline: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">CTA Button Text</label>
                      <input
                        type="text"
                        value={localConfig.hero?.ctaText || ''}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          hero: {...localConfig.hero, ctaText: e.target.value}
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Search Placeholder</label>
                      <input
                        type="text"
                        value={localConfig.hero?.placeholderText || ''}
                        onChange={(e) => setLocalConfig({
                          ...localConfig,
                          hero: {...localConfig.hero, placeholderText: e.target.value}
                        })}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Background Image URL</label>
                    <input
                      type="text"
                      value={localConfig.hero?.backgroundImage || ''}
                      onChange={(e) => setLocalConfig({
                        ...localConfig,
                        hero: {...localConfig.hero, backgroundImage: e.target.value}
                      })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Service Categories */}
              {activeTab === 'services' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Service Categories</h2>

                  {localConfig.serviceCategories?.map((category: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Category {index + 1}</h3>
                        <button
                          onClick={() => {
                            const newCategories = localConfig.serviceCategories.filter((_: any, i: number) => i !== index);
                            setLocalConfig({...localConfig, serviceCategories: newCategories});
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">Title</label>
                          <input
                            type="text"
                            value={category.title}
                            onChange={(e) => {
                              const newCategories = [...localConfig.serviceCategories];
                              newCategories[index].title = e.target.value;
                              setLocalConfig({...localConfig, serviceCategories: newCategories});
                            }}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">Icon</label>
                          <input
                            type="text"
                            value={category.icon}
                            onChange={(e) => {
                              const newCategories = [...localConfig.serviceCategories];
                              newCategories[index].icon = e.target.value;
                              setLocalConfig({...localConfig, serviceCategories: newCategories});
                            }}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Description</label>
                        <input
                          type="text"
                          value={category.description}
                          onChange={(e) => {
                            const newCategories = [...localConfig.serviceCategories];
                            newCategories[index].description = e.target.value;
                            setLocalConfig({...localConfig, serviceCategories: newCategories});
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      const newCategory = {
                        id: `category-${Date.now()}`,
                        title: "New Category",
                        description: "Description",
                        icon: "📦",
                        image: "https://ext.same-assets.com/1079325698/3377177075.webp"
                      };
                      setLocalConfig({
                        ...localConfig,
                        serviceCategories: [...(localConfig.serviceCategories || []), newCategory]
                      });
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                  >
                    Add Category
                  </button>
                </div>
              )}

              {/* Theme Selection */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Theme & Colors</h2>

                  <div>
                    <label className="block text-sm font-medium mb-4">Select Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {themes && Object.entries(themes).map(([key, theme]: [string, any]) => (
                        <button
                          key={key}
                          onClick={() => setLocalConfig({...localConfig, theme: key})}
                          className={`p-4 border-2 rounded-lg ${
                            localConfig.theme === key
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex gap-2 mb-2 justify-center">
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.secondary }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: theme.accent }}
                            />
                          </div>
                          <div className="text-sm font-medium">{theme.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {localConfig.theme === 'custom' && (
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">
                        Custom theme colors can be configured by editing the theme configuration directly.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Export/Import */}
              {activeTab === 'export' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Export/Import Configuration</h2>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Export Configuration</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download your current configuration as a JSON file for backup or sharing
                      </p>
                      <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                      >
                        <Download className="h-4 w-4" />
                        Export Configuration
                      </button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-2">Import Configuration</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a previously exported configuration file
                      </p>
                      <label className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer w-fit">
                        <Upload className="h-4 w-4" />
                        Import Configuration
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Pro Tip:</strong> Export your configuration before making major changes so you can easily revert if needed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-card rounded-lg border p-6">
          <h3 className="font-semibold mb-3">Deployment Instructions</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. <strong>Deploy Once:</strong> Deploy this base code to your hosting provider (Netlify, Vercel, etc.)</p>
            <p>2. <strong>Configure:</strong> Use this admin panel to select your niche and customize all settings</p>
            <p>3. <strong>No Code Changes:</strong> All configuration is stored in the backend - no need to redeploy</p>
            <p>4. <strong>Multiple Sites:</strong> Use the same codebase for multiple sites by changing configuration</p>
            <p>5. <strong>Export/Import:</strong> Easily backup and share configurations between deployments</p>
          </div>
        </div>
      </div>
    </div>
  );
}
