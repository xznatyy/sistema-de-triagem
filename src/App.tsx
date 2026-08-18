import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TriageFormView } from './components/TriageFormView';
import { HistoryView } from './components/HistoryView';
import { ApiDocsView } from './components/ApiDocsView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { TriageTicket, PatientInfo, VitalSigns, TriageQuestionnaire, NotificationItem, DashboardStats, TicketStatus, AIAnalysis } from './types';
import { soundManager } from './lib/soundEffect';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'triage' | 'history' | 'api'>('dashboard');
  const [tickets, setTickets] = useState<TriageTicket[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalToday: 0,
    waitingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    averageWaitMinutes: 0,
    slaBreachCount: 0,
    colorBreakdown: { red: 0, orange: 0, yellow: 0, green: 0, blue: 0 }
  });

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [retriageData, setRetriageData] = useState<any>(null);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<TriageTicket | null>(null);

  // Fetch all backend data
  const loadData = useCallback(async () => {
    try {
      const [ticketsRes, statsRes, notifsRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/stats/summary'),
        fetch('/api/notifications')
      ]);

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets || []);
      }

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (notifsRes.ok) {
        setNotifications(await notifsRes.json());
      }
    } catch (e) {
      console.error('Error fetching triage data from server:', e);
    }
  }, []);

  // Poll server every 4 seconds for real-time dashboard updates
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Create Triage Ticket
  const handleCreateTicket = async (
    patient: PatientInfo,
    vitalSigns: VitalSigns,
    questionnaire: TriageQuestionnaire,
    nurseName: string,
    aiAnalysis?: AIAnalysis
  ) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          vitalSigns,
          questionnaire,
          triageNurse: nurseName,
          aiAnalysis
        })
      });

      if (res.ok) {
        const newTicket: TriageTicket = await res.json();
        if (newTicket.color === 'red' || newTicket.color === 'orange') {
          soundManager.playEmergencyAlarm();
        }
        setRetriageData(null);
        await loadData();
        setActiveTab('dashboard');
      } else {
        alert('Ocorreu um erro ao gravar a triagem no servidor.');
      }
    } catch (e) {
      console.error('Error submitting triage:', e);
      alert('Falha de conexão com o servidor ao enviar triagem.');
    }
  };

  // Change Ticket Status
  const handleStatusChange = async (
    id: string,
    status: TicketStatus,
    room?: string,
    doctor?: string,
    notes?: string
  ) => {
    try {
      const res = await fetch(`/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, room, attendingDoctor: doctor, user: 'Equipe de Atendimento', notes })
      });

      if (res.ok) {
        await loadData();
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  // Mark notification read
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRetriage = (ticket: TriageTicket) => {
    setRetriageData(ticket);
    setActiveTab('triage');
  };

  const emergencyCount = tickets.filter(t => t.status === 'aguardando' && (t.color === 'red' || t.color === 'orange')).length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => {
          if (tab !== 'triage') setRetriageData(null);
          setActiveTab(tab);
        }}
        unreadNotificationsCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        emergencyCount={emergencyCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            tickets={tickets}
            stats={stats}
            onRefresh={loadData}
            onStatusChange={handleStatusChange}
            onViewTicket={ticket => setSelectedTicketDetail(ticket)}
            onRetriageTicket={handleRetriage}
          />
        )}

        {activeTab === 'triage' && (
          <TriageFormView
            onSubmitTicket={handleCreateTicket}
            onCancel={() => {
              setRetriageData(null);
              setActiveTab('dashboard');
            }}
            initialData={retriageData}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            tickets={tickets}
            onSelectTicket={ticket => setSelectedTicketDetail(ticket)}
          />
        )}

        {activeTab === 'api' && <ApiDocsView />}
      </main>

      {/* Notification Sidebar Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onSelectTicket={ticketId => {
          setIsNotificationsOpen(false);
          const t = tickets.find(x => x.id === ticketId);
          if (t) setSelectedTicketDetail(t);
        }}
      />
    </div>
  );
}
