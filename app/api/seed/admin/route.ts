import { NextResponse } from 'next/server';
import { seedAdminUser } from '@/lib/seed-admin';

/**
 * API route to seed the database with an admin user
 * This should only be used in development or for initial setup
 */
export async function GET() {
  try {
    const result = await seedAdminUser();
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.message 
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed admin user' 
      }, 
      { status: 500 }
    );
  }
}
