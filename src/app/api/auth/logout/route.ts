import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (token) {
      await logoutUser(token.value);
      cookieStore.delete('auth-token');
    }

    return NextResponse.json({
      success: true,
      redirect: '/'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
