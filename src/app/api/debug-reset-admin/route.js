import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

// Temporary endpoint to reset admin password and show all users
export async function GET() {
  try {
    // Delete any existing admin and recreate with known credentials
    await prisma.user.deleteMany({ where: { role: 'ADMIN' } });
    
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: 'adminpassword',
        role: 'ADMIN',
      }
    });

    // List all users
    const allUsers = await prisma.user.findMany({
      select: { username: true, role: true, password: true }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user reset successfully!',
      createdAdmin: { username: admin.username, password: 'adminpassword', role: admin.role },
      allUsers,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    });
  }
}
