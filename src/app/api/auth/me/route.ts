import { extractUserFromToken } from '@/entities/user/model/types';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ✅ Route Handler: GET /api/auth/me
// Obtener usuario actual desde httpOnly cookies
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authenticated' },
        { status: 401 }
      );
    }

    const user = extractUserFromToken(token);
    
    if (!user) {
      // Token inválido o expirado
      cookieStore.delete('auth_token');
      cookieStore.delete('refresh_token');
      
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
