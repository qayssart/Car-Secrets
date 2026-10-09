export type Role = 'owner' | 'mechanic';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'completed';
export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface CauseFix {
  cause: string;
  fix: string;
  severity: Severity;
}

export interface DiagnosticSystem {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  symptoms: string[];
  followUps: {
    question: string;
    options: string[];
  }[];
  causeMap: {
    symptoms: string[];
    causes: CauseFix[];
  }[];
}

export interface DiagnosticLog {
  id: string;
  owner_name: string;
  car_make: string | null;
  car_model: string | null;
  car_year: string | null;
  system_name: string;
  symptoms: string[];
  follow_up_answers: Record<string, string>;
  causes: CauseFix[];
  severity: Severity;
  notes: string | null;
  created_at: string;
}

export interface MechanicRequest {
  id: string;
  diagnostic_log_id: string | null;
  owner_name: string;
  owner_contact: string | null;
  car_info: string | null;
  system_name: string;
  symptoms: string[];
  causes: CauseFix[];
  severity: Severity;
  location: string | null;
  status: RequestStatus;
  mechanic_notes: string | null;
  created_at: string;
}

export interface RepairJob {
  id: string;
  request_id: string | null;
  owner_name: string;
  car_info: string | null;
  system_name: string;
  status: JobStatus;
  scheduled_date: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
}

export interface OBDCode {
  code: string;
  system: string;
  description: string;
  severity: Severity;
  causes: string[];
  fixes: string[];
}
