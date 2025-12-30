import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db'
import { createSession, deleteSession } from '@/src/lib/auth'
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, action } = await request.json();

    if (action === 'logout') {
      await deleteSession();
      return NextResponse.json({ success: true });
    }

    // Login
    const admin = await prisma.admin.findUnique({ where: { email } });
    
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    await createSession(admin.id);

    return NextResponse.json({
      success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
