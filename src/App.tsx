import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { User, PatientSummary, AnalyticsSummary, AshaAlert, UserRole } from './types';
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { DashboardView } from './views/DashboardView';
import { FollowUpQueueView } from './views/FollowUpQueueView';
import { PatientsDirectoryView } from './views/PatientsDirectoryView';
import { PatientDetailView } from './views/PatientDetailView';
import { AlertsView } from './views/AlertsView';
import { AnalyticsView } from './views/AnalyticsView';
import { AdminDataView } from './views/AdminDataView';
import { HelpMethodologyView } from './views/HelpMethodologyView';
import { CallModal } from './components/CallModal';
import { FieldInterventionModal } from './components/FieldInterventionModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [demoUsers, setDemoUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [alerts, setAlerts] = useState<AshaAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [callingPatient, setCallingPatient] = useState<PatientSummary | null>(null);
  const [interveningPatient, setInterveningPatient] = useState<PatientSummary | null>(null);

  // Initialize application data
  const loadData = useCallback(async () => {
    try {
      const [u, demoList, patList, anal, altList] = await Promise.all([
        api.fetchCurrentUser(),
        api.fetchDemoUsers(),
        api.fetchPatients(),
        api.fetchAnalytics(),
        api.fetchAshaAlerts()
      ]);

      setCurrentUser(u);
      setDemoUsers(demoList);
      setPatients(patList);
      setAnalytics(anal);
      setAlerts(altList);
    } catch (err) {
      console.error('Error initializing application data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Role Switching
  const handleSwitchRole = async (role: UserRole) => {
    try {
      setLoading(true);
      const user = await api.loginAs(role);
      setCurrentUser(user);
      const patList = await api.fetchPatients();
      setPatients(patList);
      const anal = await api.fetchAnalytics();
      setAnalytics(anal);
      const altList = await api.fetchAshaAlerts();
      setAlerts(altList);
      setSelectedPatientId(null);

      // If switched away from district admin, ensure admin tab is not active
      if (role !== 'DISTRICT_ADMIN' && activeTab === 'admin') {
        setActiveTab('dashboard');
      }
    } catch (e: any) {
      alert(`Error switching role: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Submit call outcome
  const handleSubmitCallOutcome = async (outcome: string, notes: string) => {
    if (!callingPatient) return;
    try {
      const res = await api.simulateCall(callingPatient.patient_id, outcome, notes);
      const [updatedPatients, updatedAlerts, updatedAnalytics] = await Promise.all([
        api.fetchPatients(),
        api.fetchAshaAlerts(),
        api.fetchAnalytics()
      ]);
      setPatients(updatedPatients);
      setAlerts(updatedAlerts);
      setAnalytics(updatedAnalytics);

      if (res.alert_created) {
        console.log('🔴 ASHA Alert triggered for patient:', callingPatient.patient_id);
      }
    } catch (err: any) {
      alert(`Call outcome logging error: ${err.message}`);
    }
  };

  // Resolve an alert
  const handleResolveAlert = async (alertId: string, notes: string) => {
    try {
      await api.resolveAlert(alertId, notes);
      const [updatedAlerts, updatedPatients] = await Promise.all([
        api.fetchAshaAlerts(),
        api.fetchPatients()
      ]);
      setAlerts(updatedAlerts);
      setPatients(updatedPatients);
    } catch (err: any) {
      alert(`Error resolving alert: ${err.message}`);
    }
  };

  // Verify and record care restoration
  const handleRestoreCare = async (patientId: string, reason: string) => {
    try {
      await api.verifyCareRestored(patientId, reason);
      const [updatedPatients, updatedAlerts, updatedAnalytics] = await Promise.all([
        api.fetchPatients(),
        api.fetchAshaAlerts(),
        api.fetchAnalytics()
      ]);
      setPatients(updatedPatients);
      setAlerts(updatedAlerts);
      setAnalytics(updatedAnalytics);
    } catch (err: any) {
      alert(`Error restoring care: ${err.message}`);
    }
  };

  const handleRecordDispense = async (patientId: string, items: string) => {
    try {
      await api.recordMedicineDispensation(patientId, items);
    } catch (err: any) {
      console.error('Dispense error:', err);
    }
  };

  const openAlertsCount = alerts.filter(a => a.status === 'OPEN').length;

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 mx-auto border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-sm font-semibold text-slate-800">
            Rural Health Follow-Up Assurance
          </h2>
          <p className="text-xs text-slate-500">
            Loading continuity-of-care operations dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex antialiased">
      {/* Primary Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          setSelectedPatientId(null);
        }}
        currentUser={currentUser}
        openAlertCount={openAlertsCount}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <AppHeader
          currentUser={currentUser}
          activeTab={selectedPatientId ? 'patient_profile' : activeTab}
          onSwitchRole={handleSwitchRole}
          demoUsers={demoUsers}
          onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Patient 360 Detail View */}
          {selectedPatientId ? (
            <PatientDetailView
              patientId={selectedPatientId}
              onBack={() => setSelectedPatientId(null)}
              onCallPatient={p => setCallingPatient(p)}
              onRecordIntervention={p => setInterveningPatient(p)}
            />
          ) : (
            <>
              {/* 1. Dashboard View */}
              {activeTab === 'dashboard' && currentUser && (
                <DashboardView
                  user={currentUser}
                  patients={patients}
                  analytics={analytics}
                  alerts={alerts}
                  onSelectPatient={id => setSelectedPatientId(id)}
                  onCallPatient={p => setCallingPatient(p)}
                  onRecordIntervention={p => setInterveningPatient(p)}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {/* 2. Follow-Up Queue View */}
              {activeTab === 'queue' && (
                <FollowUpQueueView
                  patients={patients}
                  onSelectPatient={id => setSelectedPatientId(id)}
                  onCallPatient={p => setCallingPatient(p)}
                  onRecordIntervention={p => setInterveningPatient(p)}
                />
              )}

              {/* 3. Patients Directory View */}
              {activeTab === 'patients' && (
                <PatientsDirectoryView
                  patients={patients}
                  onSelectPatient={id => setSelectedPatientId(id)}
                  onCallPatient={p => setCallingPatient(p)}
                  onRecordIntervention={p => setInterveningPatient(p)}
                />
              )}

              {/* 4. Actionable Alerts View */}
              {activeTab === 'alerts' && (
                <AlertsView
                  alerts={alerts}
                  patients={patients}
                  onCallAgain={patientId => {
                    const pat = patients.find(p => p.patient_id === patientId);
                    if (pat) setCallingPatient(pat);
                  }}
                  onRecordOutcome={patientId => {
                    const pat = patients.find(p => p.patient_id === patientId);
                    if (pat) setInterveningPatient(pat);
                  }}
                  onResolveAlert={handleResolveAlert}
                  onSelectPatient={id => setSelectedPatientId(id)}
                />
              )}

              {/* 5. Executive Analytics View */}
              {activeTab === 'analytics' && currentUser && (
                <AnalyticsView
                  analytics={analytics}
                  user={currentUser}
                />
              )}

              {/* 6. Admin & Data Management (District Admin Only) */}
              {activeTab === 'admin' && currentUser?.role === 'DISTRICT_ADMIN' && (
                <AdminDataView onDataReload={loadData} />
              )}

              {/* 7. Help & Methodology */}
              {activeTab === 'methodology' && <HelpMethodologyView />}
            </>
          )}
        </main>

        {/* Calm Healthcare Footer */}
        <footer className="bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Rural Health Follow-Up Assurance</span>
              <span>·</span>
              <span>Balrampur District Health Society & Ayushman Arogya Mandir</span>
            </div>
            <div className="text-[11px] text-slate-400">
              ABDM Compliant · Non-Communicable Diseases Continuity Care Engine
            </div>
          </div>
        </footer>
      </div>

      {/* Call Patient Modal */}
      {callingPatient && (
        <CallModal
          patient={callingPatient}
          onClose={() => setCallingPatient(null)}
          onSubmitOutcome={handleSubmitCallOutcome}
        />
      )}

      {/* Field Intervention / Care Restored Modal */}
      {interveningPatient && (
        <FieldInterventionModal
          patient={interveningPatient}
          onClose={() => setInterveningPatient(null)}
          onRestoreCare={handleRestoreCare}
          onRecordDispense={handleRecordDispense}
        />
      )}
    </div>
  );
}
