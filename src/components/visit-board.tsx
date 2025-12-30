'use client';

import type { Visit, VisitStatus } from '@/types';

interface VisitBoardProps {
  visits: Visit[];
  onRefresh: () => void;
}

export default function VisitBoard({ visits, onRefresh }: VisitBoardProps) {
  const grouped = {
    WAITING: visits.filter(v => v.status === 'WAITING'),
    IN_ROOM: visits.filter(v => v.status === 'IN_ROOM'),
    FINISHED: visits.filter(v => v.status === 'FINISHED'),
  };

  const updateStatus = async (id: string, status: VisitStatus) => {
    try {
      await fetch('/api/visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteVisit = async (id: string) => {
    if (!confirm('Supprimer cette visite ?')) return;
    
    try {
      await fetch(`/api/visits?id=${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (error) {
      console.error('Error deleting visit:', error);
    }
  };

  const columns = [
    {
      status: 'WAITING' as VisitStatus,
      title: '⏳ En attente',
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
    {
      status: 'IN_ROOM' as VisitStatus,
      title: '🏥 En consultation',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      status: 'FINISHED' as VisitStatus,
      title: '✅ Terminées',
      color: 'from-green-400 to-emerald-400',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.status} className="flex flex-col">
          {/* Column Header */}
          <div className={`bg-gradient-to-r ${column.color} rounded-t-2xl p-4 shadow-lg`}>
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>{column.title}</span>
              <span className="bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                {grouped[column.status].length}
              </span>
            </h3>
          </div>

          {/* Column Body */}
          <div className={`${column.bgColor} border-2 ${column.borderColor} rounded-b-2xl p-4 min-h-[400px] max-h-[600px] overflow-y-auto space-y-3`}>
            {grouped[column.status].length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-sm">Aucune visite</p>
              </div>
            ) : (
              grouped[column.status].map((visit) => (
                <VisitCard
                  key={visit.id}
                  visit={visit}
                  onUpdateStatus={updateStatus}
                  onDelete={deleteVisit}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

interface VisitCardProps {
  visit: Visit;
  onUpdateStatus: (id: string, status: VisitStatus) => void;
  onDelete: (id: string) => void;
}

function VisitCard({ visit, onUpdateStatus, onDelete }: VisitCardProps) {
  const nextStatus: Record<VisitStatus, { status: VisitStatus; label: string; icon: string } | null> = {
    WAITING: { status: 'IN_ROOM', label: 'Commencer', icon: '▶️' },
    IN_ROOM: { status: 'FINISHED', label: 'Terminer', icon: '✅' },
    FINISHED: null,
  };

  const next = nextStatus[visit.status];

  return (
    <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-200 border-2 border-gray-100 hover:border-gray-200 animate-slide-up">
      {/* Queue Number Badge */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{visit.queueNumber}</span>
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{visit.patientName}</h4>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {visit.patientPhone}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onDelete(visit.id)}
          className="text-gray-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Reason */}
      {visit.reason && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2 mb-3">
          💬 {visit.reason}
        </p>
      )}

      {/* Time */}
      <p className="text-xs text-gray-400 mb-3">
        🕐 {new Date(visit.createdAt).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </p>

      {/* Action Button */}
      {next && (
        <button
          onClick={() => onUpdateStatus(visit.id, next.status)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>{next.icon}</span>
          {next.label}
        </button>
      )}
    </div>
  );
}
