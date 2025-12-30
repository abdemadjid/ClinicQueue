export type VisitStatus = 'WAITING' | 'IN_ROOM' | 'FINISHED';

export interface Visit {
  id: string;
  queueNumber: number;
  patientName: string;
  patientPhone: string;
  status: VisitStatus;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}

export interface CreateVisitDto {
  patientName: string;
  patientPhone: string;
  reason?: string;
}

export interface UpdateVisitDto {
  status?: VisitStatus;
  reason?: string;
}