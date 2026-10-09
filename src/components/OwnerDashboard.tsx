import { useState, useEffect, useCallback } from 'react';
import {
  ClipboardList,
  Send,
  Trash2,
  Wrench,
  Calendar,
  MapPin,
  Loader2,
  X,
  CheckCircle2,
  Phone,
  Car,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { DiagnosticLog, MechanicRequest, RequestStatus } from '@/types';
import { SeverityBadge, RequestStatusBadge } from '@/components/ui/Badges';
import { formatDate } from '@/lib/utils';

interface OwnerDashboardProps {
  ownerName: string;
  carInfo: { make: string; model: string; year: string };
  refreshTrigger: number;
}

export function OwnerDashboard({ ownerName, carInfo, refreshTrigger }: OwnerDashboardProps) {
  const [logs, setLogs] = useState<DiagnosticLog[]>([]);
  const [requests, setRequests] = useState<MechanicRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DiagnosticLog | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('diagnostic_logs')
      .select('*')
      .order('created_at', { ascending: false });
    setLogs((data ?? []) as DiagnosticLog[]);
    setLoading(false);
  }, []);

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('mechanic_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data ?? []) as MechanicRequest[]);
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchRequests();
  }, [fetchLogs, fetchRequests, refreshTrigger]);

  async function handleDeleteLog(id: string) {
    await supabase.from('diagnostic_logs').delete().eq('id', id);
    fetchLogs();
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard icon={ClipboardList} label="سجلات التشخيص" value={logs.length} color="autofix" />
        <StatCard icon={Send} label="طلبات الميكانيكي" value={requests.length} color="amber" />
        <StatCard
          icon={Wrench}
          label="طلبات مقبولة"
          value={requests.filter((r) => r.status === 'accepted' || r.status === 'completed').length}
          color="emerald"
        />
      </div>

      {/* Diagnostic Logs */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">سجلات التشخيص السابقة</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-autofix-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <ClipboardList className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              لا توجد سجلات تشخيص بعد. ابدأ تشخيصًا من المعالج للبدء.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="group rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{log.system_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {log.car_year} {log.car_make} {log.car_model}
                    </p>
                  </div>
                  <SeverityBadge severity={log.severity} />
                </div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {log.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                  تم تحديد {log.causes.length} سبب محتمل
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                  <span className="text-xs text-gray-400">{formatDate(log.created_at)}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowRequestModal(true);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-autofix-50 px-2.5 py-1.5 text-xs font-semibold text-autofix-700 transition-colors hover:bg-autofix-100 dark:bg-autofix-900/30 dark:text-autofix-400 dark:hover:bg-autofix-900/50"
                    >
                      <Send className="h-3 w-3" /> طلب ميكانيكي
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mechanic Requests */}
      <div>
        <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">طلبات الميكانيكي الخاصة بك</h2>
        {requests.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <Send className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              لم ترسل أي طلبات ميكانيكي بعد. استخدم زر "طلب ميكانيكي" على أحد سجلات التشخيص.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{req.system_name}</p>
                    {req.car_info && (
                      <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Car className="h-3 w-3" /> {req.car_info}
                      </p>
                    )}
                  </div>
                  <RequestStatusBadge status={req.status} />
                </div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {req.symptoms.map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {req.location && (
                  <p className="mb-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <MapPin className="h-3 w-3" /> {req.location}
                  </p>
                )}
                {req.mechanic_notes && req.status !== 'pending' && (
                  <div className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <span className="font-semibold">ملاحظات الميكانيكي: </span>
                    {req.mechanic_notes}
                  </div>
                )}
                <div className="mt-2 border-t border-gray-100 pt-2 dark:border-gray-700">
                  <span className="text-xs text-gray-400">{formatDate(req.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Mechanic Modal */}
      {showRequestModal && selectedLog && (
        <RequestMechanicModal
          log={selectedLog}
          ownerName={ownerName}
          carInfo={carInfo}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedLog(null);
          }}
          onSent={() => {
            fetchRequests();
            setShowRequestModal(false);
            setSelectedLog(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof ClipboardList;
  label: string;
  value: number;
  color: 'autofix' | 'amber' | 'emerald';
}) {
  const colorMap = {
    autofix: 'bg-autofix-50 text-autofix-600 dark:bg-autofix-900/30 dark:text-autofix-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  };
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function RequestMechanicModal({
  log,
  ownerName,
  carInfo,
  onClose,
  onSent,
}: {
  log: DiagnosticLog;
  ownerName: string;
  carInfo: { make: string; model: string; year: string };
  onClose: () => void;
  onSent: () => void;
}) {
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    if (!contact.trim() || !location.trim()) {
      setError('يرجى إدخال معلومات التواصل والموقع.');
      return;
    }
    setSending(true);
    setError(null);

    const carInfoStr = [log.car_year, log.car_make, log.car_model].filter(Boolean).join(' ') || 'سيارة غير محددة';

    const { error: insertError } = await supabase.from('mechanic_requests').insert({
      diagnostic_log_id: log.id,
      owner_name: ownerName || 'مستخدم',
      owner_contact: contact,
      car_info: carInfoStr,
      system_name: log.system_name,
      symptoms: log.symptoms,
      causes: log.causes,
      severity: log.severity,
      location,
      status: 'pending' as RequestStatus,
    });

    setSending(false);
    if (insertError) {
      setError('تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.');
      return;
    }
    onSent();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">طلب ميكانيكي قريب</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Diagnostic summary */}
        <div className="mb-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">{log.system_name}</span>
            <SeverityBadge severity={log.severity} />
          </div>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            {log.car_year} {log.car_make} {log.car_model}
          </p>
          <div className="flex flex-wrap gap-1">
            {log.symptoms.map((s, idx) => (
              <span
                key={idx}
                className="rounded-md bg-white px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
              >
                {s}
              </span>
            ))}
          </div>
          {log.causes.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">الأسباب المحددة</p>
              {log.causes.map((c, idx) => (
                <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
                  • {c.cause}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Phone className="ml-1 inline h-4 w-4" /> معلومات التواصل (هاتف أو بريد)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="مثل: 0551234567"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              <MapPin className="ml-1 inline h-4 w-4" /> موقعك
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="مثل: وسط البلد، الرياض"
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleSend}
            disabled={sending}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-autofix-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-autofix-700 disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> إرسال الطلب
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
