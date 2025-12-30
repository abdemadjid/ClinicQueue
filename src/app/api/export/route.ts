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
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const visits = await prisma.visit.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { queueNumber: 'asc' },
    });

    // Generate CSV
    const csvHeader = 'N° File,Patient,Téléphone,Statut,Raison,Heure\n';
    const csvRows = visits.map(visit => {
      const status = visit.status === 'WAITING' ? 'En attente' : 
                     visit.status === 'IN_ROOM' ? 'En consultation' : 'Terminé';
      return [
        visit.queueNumber,
        visit.patientName,
        visit.patientPhone,
        status,
        visit.reason || '',
        new Date(visit.createdAt).toLocaleTimeString('fr-FR'),
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="visites-${date}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}