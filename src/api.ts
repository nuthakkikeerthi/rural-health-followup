import type {
  User,
  PatientSummary,
  JourneyEvent,
  CCI7Result,
  CareBreakpoint,
  KestrelStatus,
  AshaAlert,
  PatientPrediction,
  MLMetrics,
  LinkageStats,
  LinkageRecord,
  ImportSummary,
  AnalyticsSummary
} from './types';

class ApiService {
  private activeUser: User | null = null;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.flushOfflineQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  public setUser(user: User) {
    this.activeUser = user;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('active_user_role', user.role);
      localStorage.setItem('active_user_id', user.id);
    }
  }

  public getUser(): User | null {
    return this.activeUser;
  }

  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.activeUser) {
      headers['x-user-role'] = this.activeUser.role;
      headers['x-user-id'] = this.activeUser.id;
    }
    return headers;
  }

  public async fetchDemoUsers(): Promise<User[]> {
    const res = await fetch('/api/auth/demo-users');
    const data = await res.json();
    return data.users;
  }

  public async fetchCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me', { headers: this.getHeaders() });
    const data = await res.json();
    this.activeUser = data.user;
    return data.user;
  }

  public async loginAs(role: string, email?: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, email })
    });
    const data = await res.json();
    this.setUser(data.user);
    return data.user;
  }

  public async fetchPatients(): Promise<PatientSummary[]> {
    try {
      const res = await fetch('/api/patients', { headers: this.getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch patient queue');
      const data = await res.json();
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('cached_patients', JSON.stringify(data.patients));
      }
      return data.patients;
    } catch (err) {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('cached_patients');
        if (cached) return JSON.parse(cached);
      }
      throw err;
    }
  }

  public async fetchPatientDetail(id: string): Promise<{
    patient: PatientSummary;
    journey: { events: JourneyEvent[] };
    cci7: CCI7Result;
    care_breakpoint: CareBreakpoint | null;
    kestrel: KestrelStatus;
    ml_prediction: PatientPrediction;
    outreach_history: any[];
    alerts: AshaAlert[];
    clinical_data: any;
  }> {
    const res = await fetch(`/api/patients/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`Failed to load patient ${id}`);
    return res.json();
  }

  public async simulateCall(patientId: string, outcome: string, notes?: string): Promise<{
    success: boolean;
    alert_created: boolean;
    message: string;
  }> {
    if (!this.isOnline) {
      this.enqueueOfflineAction({
        type: 'CALL',
        patientId,
        outcome,
        notes,
        timestamp: new Date().toISOString()
      });
      return {
        success: true,
        alert_created: false,
        message: 'Saved call outcome to offline queue. Will sync when network is restored.'
      };
    }

    const res = await fetch(`/api/patients/${patientId}/call`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ outcome, notes })
    });
    return res.json();
  }

  public async fetchAshaAlerts(): Promise<AshaAlert[]> {
    const res = await fetch('/api/alerts', { headers: this.getHeaders() });
    const data = await res.json();
    return data.alerts;
  }

  public async resolveAlert(alertId: string, notes: string): Promise<boolean> {
    const res = await fetch(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ notes })
    });
    return res.ok;
  }

  public async verifyCareRestored(patientId: string, reason: string): Promise<any> {
    const res = await fetch('/api/interventions/restore-care', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        patient_id: patientId,
        resolution_reason: reason,
        verified_by: this.activeUser?.name || 'Verified Official'
      })
    });
    return res.json();
  }

  public async recordMedicineDispensation(patientId: string, items: string): Promise<any> {
    const res = await fetch('/api/interventions/record-dispense', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ patient_id: patientId, items })
    });
    return res.json();
  }

  public async fetchAnalytics(): Promise<AnalyticsSummary> {
    const res = await fetch('/api/analytics', { headers: this.getHeaders() });
    return res.json();
  }

  public async fetchMLMetrics(): Promise<MLMetrics> {
    const res = await fetch('/api/ml/metrics', { headers: this.getHeaders() });
    const data = await res.json();
    return data.metrics;
  }

  public async fetchLinkageStats(): Promise<{ stats: LinkageStats; sample_records: LinkageRecord[] }> {
    const res = await fetch('/api/linkage/stats', { headers: this.getHeaders() });
    return res.json();
  }

  public async uploadCompetitionZip(file: File): Promise<{ success: boolean; summary: ImportSummary; message: string }> {
    const formData = new FormData();
    formData.append('zipFile', file);

    const headers: Record<string, string> = {};
    if (this.activeUser) {
      headers['x-user-role'] = this.activeUser.role;
      headers['x-user-id'] = this.activeUser.id;
    }

    const res = await fetch('/api/dataset/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to upload competition ZIP archive');
    }

    return res.json();
  }

  public async loadSampleCompetitionZip(): Promise<{ success: boolean; summary: ImportSummary; message: string }> {
    const res = await fetch('/api/dataset/load-sample', {
      method: 'POST',
      headers: this.getHeaders()
    });
    return res.json();
  }

  public async fetchDatasetSummary(): Promise<any> {
    const res = await fetch('/api/dataset/summary', { headers: this.getHeaders() });
    return res.json();
  }

  private enqueueOfflineAction(action: any) {
    if (typeof localStorage === 'undefined') return;
    const queue = JSON.parse(localStorage.getItem('offline_action_queue') || '[]');
    queue.push(action);
    localStorage.setItem('offline_action_queue', JSON.stringify(queue));
  }

  private async flushOfflineQueue() {
    if (typeof localStorage === 'undefined') return;
    const queue = JSON.parse(localStorage.getItem('offline_action_queue') || '[]');
    if (queue.length === 0) return;

    for (const item of queue) {
      try {
        if (item.type === 'CALL') {
          await this.simulateCall(item.patientId, item.outcome, item.notes);
        }
      } catch (e) {
        console.error('Error syncing queued item:', e);
      }
    }
    localStorage.removeItem('offline_action_queue');
  }
}

export const api = new ApiService();
