import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/db';
import { getSessionFromRequest } from '@/src/lib/auth';

export async function GET(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    let where = {};
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where = {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    const visits = await prisma.visit.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { queueNumber: 'asc' },
      ],
    });

    return NextResponse.json({ visits });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientName, patientPhone, reason } = body;

    // Get next queue number for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastVisit = await prisma.visit.findFirst({
      where: { createdAt: { gte: today } },
      orderBy: { queueNumber: 'desc' },
    });

    const queueNumber = (lastVisit?.queueNumber || 0) + 1;

    const visit = await prisma.visit.create({
      data: {
        queueNumber,
        patientName,
        patientPhone,
        reason,
        status: 'WAITING',
      },
    });

    return NextResponse.json({ visit }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    const visit = await prisma.visit.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ visit });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const adminId = getSessionFromRequest(request);
  if (!adminId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.visit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
