'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function TestAuthPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Auth loading:', loading);
    console.log('User object:', user);
    if (user) {
      console.log('User city:', user.city);
      console.log('User state:', user.state);
      console.log('User zipcode:', user.zipcode);
      console.log('User address:', user.address);
    }
  }, [user, loading]);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="space-y-2">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>User: {user ? 'Logged In' : 'Not Logged In'}</p>
        {user && (
          <>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
            <p>City: {user.city || 'Not set'}</p>
            <p>State: {user.state || 'Not set'}</p>
            <p>ZIP: {user.zipcode || 'Not set'}</p>
            <p>Address: {user.address || 'Not set'}</p>
          </>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-muted rounded">
        <h2 className="font-semibold mb-2">Debug Info (Check Console)</h2>
        <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}