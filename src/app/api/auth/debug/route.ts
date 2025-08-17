import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { sql } from '@/lib/neon';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth-token');
    
    const debug: any = {
      hasCookie: !!authToken,
      cookieValue: authToken?.value ? 'Set (hidden for security)' : 'Not set',
      cookieName: authToken?.name,
    };

    if (authToken?.value) {
      try {
        const decoded = verifyToken(authToken.value);
        debug.tokenValid = !!decoded;
        debug.tokenPayload = decoded ? {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
          iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null
        } : null;

        // Check if user exists in database
        if (decoded?.userId) {
          const userResult = await sql`
            SELECT id, email, role, business_id 
            FROM users 
            WHERE id = ${decoded.userId}::uuid
          `;
          
          debug.userInDatabase = userResult.length > 0;
          if (userResult.length > 0) {
            debug.userInfo = userResult[0];
          }

          // Check for active session
          const sessionResult = await sql`
            SELECT token, expires_at
            FROM sessions
            WHERE user_id = ${decoded.userId}::uuid
              AND expires_at > NOW()
            LIMIT 1
          `;
          
          debug.hasActiveSession = sessionResult.length > 0;
          if (sessionResult.length > 0) {
            debug.sessionExpires = sessionResult[0].expires_at;
          }
        }
      } catch (error: any) {
        debug.tokenError = error.message;
      }
    }

    // Check JWT secret configuration
    debug.jwtSecretConfigured = !!process.env.JWT_SECRET;
    
    return NextResponse.json({
      debug,
      instructions: {
        ifNotLoggedIn: "Login at /login?type=business",
        ifTokenExpired: "Token expired, please login again",
        ifNoSession: "Session expired, please login again",
        ifNoCookie: "No auth cookie found, please login"
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Debug check failed',
      details: error.message
    }, { status: 500 });
  }
}