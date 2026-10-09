import { useState, useEffect, useCallback } from 'react';
import {
  Inbox,
  Wrench,
  Calendar,
  CheckCircle2,
  X,
  Loader2,
  MapPin,
  Phone,
  Car,
  DollarSign,
  Clock,
  XCircle,
  Play,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { MechanicRequest, RepairJob, RequestStatus, JobStatus } from '@/types';
import { SeverityBadge, RequestStatusBadge, JobStatusBadge } from '@/components/ui/Badges';
import { formatDate } from '@/lib/utils';

export function MechanicDashboard() {
  const [requests, setRequests] = useState<MechanicRequest[]>([]);
  const [jobs, setJobs] = useState<RepairJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'jobs'>('requests');
  const [actionModal, setActionModal] = useState<
    | { type: 'accept'; request: MechanicRequest }
    | { type: 'decline'; request: MechanicRequest }
    | { type: 'job'; job: RepairJob }
    | null
  >(null);

  const fetchRequests = useCallback(async () => {
    const { data } = await supabase
      .from('mechanic_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests((data ?? []) as MechanicRequest[]);
  }, []);

  const fetchJobs = useCallback(async () => {
    const { data } = await supabase
      .from('repair_jobs')
      .select('*')
      .order('created_at', { ascending: false });
    setJobs((data ?? []) as RepairJob[]);
  }, []);

  useEffect(() => {
    Promise.all([fetchRequests(), fetchJobs()]).then(() => setLoading(false));
  }, [fetchRequests, fetchJobs]);

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const activeRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Inbox} label="طلبات جديدة" value={pendingRequests.length} color="amber" />
        <StatCard icon={Wrench} label="أعمال نشطة" value={jobs.filter((j) => j.status === 'in_progress').length} color="orange" />
        <StatCard icon={Calendar} label="مجدولة" value={jobs.filter((j) => j.status === 'scheduled').length} color="autofix" />
        <StatCard icon={CheckCircle2} label="مكتملة" value={jobs.filter((j) => j.status === 'completed').length} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'requests'
              ? 'bg-white text-autofix-700 shadow-sm dark:bg-gray-700 dark:text-autofix-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Inbox className="h-4 w-4" /> الطلبات الواردة
          {pendingRequests.length > 0 && (
            <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-xs text-white">{pendingRequests.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'jobs'
              ? 'bg-white text-autofix-700 shadow-sm dark:bg-gray-700 dark:text-autofix-400'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Wrench className="h-4 w-4" /> مهام الإصلاح
          {jobs.length > 0 && (
            <span className="rounded-full bg-gray-300 px-1.5 py-0.5 text-xs text-gray-700 dark:bg-gray-600 dark:text-gray-200">
              {jobs.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-autofix-500" />
        </div>
      ) : activeTab === 'requests' ? (
        <div className="space-y-4">
          {/* Pending requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">طلبات جديدة</h3>
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    onAccept={() => setActionModal({ type: 'accept', request: req })}
                    onDecline={() => setActionModal({ type: 'decline', request: req })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Processed requests */}
          {activeRequests.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">طلبات تمت معالجتها</h3>
              <div className="space-y-3">
                {activeRequests.map((req) => (
                  <RequestCard key={req.id} request={req} />
                ))}
              </div>
            </div>
          )}

          {requests.length === 0 && (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
              <Inbox className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                لا توجد طلبات ميكانيكي بعد. عندما يرسل أصحاب السيارات طلبات، ستظهر هنا.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {jobs.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
              <Wrench className="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                لا توجد مهام إصلاح بعد. اقبل طلب ميكانيكي لإنشاء مهمة.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onManage={() => setActionModal({ type: 'job', job })}
                  onStatusChange={async (status: JobStatus) => {
                    await supabase.from('repair_jobs').update({ status }).eq('id', job.id);
                    fetchJobs();
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action modals */}
      {actionModal?.type === 'accept' && (
        <AcceptRequestModal
          request={actionModal.request}
          onClose={() => setActionModal(null)}
          onAccepted={() => {
            fetchRequests();
            fetchJobs();
            setActionModal(null);
          }}
        />
      )}
      {actionModal?.type === 'decline' && (
        <DeclineRequestModal
          request={actionModal.request}
          onClose={() => setActionModal(null)}
          onDeclined={() => {
            fetchRequests();
            setActionModal(null);
          }}
        />
      )}
      {actionModal?.type === 'job' && (
        <ManageJobModal
          job={actionModal.job}
          onClose={() => setActionModal(null)}
          onUpdated={() => {
            fetchJobs();
            setActionModal(null);
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
  icon: typeof Inbox;
  label: string;
  value: number;
  color: 'autofix' | 'amber' | 'orange' | 'emerald';
}) {
  const colorMap = {
    autofix: 'bg-autofix-50 text-autofix-600 dark:bg-autofix-900/30 dark:text-autofix-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
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

function RequestCard({
  request,
  onAccept,
  onDecline,
}: {
  request: MechanicRequest;
  onAccept?: () => void;
  onDecline?: () => void;
}) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-white">{request.system_name}</p>
            <SeverityBadge severity={request.severity} />
          </div>
          {request.car_info && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Car className="h-3 w-3" /> {request.car_info}
            </p>
          )}
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        {request.symptoms.map((s, idx) => (
          <span
            key={idx}
            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            {s}
          </span>
        ))}
      </div>

      {request.causes.length > 0 && (
        <div className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">الأسباب المحددة</p>
          {request.causes.map((c, idx) => (
            <p key={idx} className="text-xs text-gray-600 dark:text-gray-400">
              • {c.cause} <span className="text-gray-400">— {c.fix}</span>
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>{request.owner_name}</span>
        {request.owner_contact && (
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" /> {request.owner_contact}
          </span>
        )}
        {request.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {request.location}
          </span>
        )}
        <span>{formatDate(request.created_at)}</span>
      </div>

      {request.mechanic_notes && request.status !== 'pending' && (
        <div className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
          <span className="font-semibold">ملاحظاتك: </span>
          {request.mechanic_notes}
        </div>
      )}

      {onAccept && onDecline && request.status === 'pending' && (
        <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
          <button
            onClick={onAccept}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" /> قبول
          </button>
          <button
            onClick={onDecline}
            className="flex items-center gap-1.5 rounded-lg border-2 border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <XCircle className="h-4 w-4" /> رفض
          </button>
        </div>
      )}
    </div>
  );
}

function JobCard({
  job,
  onManage,
  onStatusChange,
}: {
  job: RepairJob;
  onManage: () => void;
  onStatusChange: (status: JobStatus) => void;
}) {
  return (
    <div className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900 dark:text-white">{job.system_name}</p>
            <JobStatusBadge status={job.status} />
          </div>
          {job.car_info && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Car className="h-3 w-3" /> {job.car_info} — {job.owner_name}
            </p>
          )}
        </div>
        {job.estimated_cost != null && (
          <span className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <DollarSign className="h-3 w-3" />
            {Number(job.estimated_cost).toFixed(0)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        {job.scheduled_date && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDate(job.scheduled_date)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {formatDate(job.created_at)}
        </span>
      </div>

      {job.notes && (
        <div className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600 dark:bg-gray-900/50 dark:text-gray-400">
          {job.notes}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
        {job.status === 'scheduled' && (
          <button
            onClick={() => onStatusChange('in_progress')}
            className="flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-orange-700"
          >
            <Play className="h-3 w-3" /> بدء العمل
          </button>
        )}
        {job.status === 'in_progress' && (
          <button
            onClick={() => onStatusChange('completed')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-3 w-3" /> إنهاء
          </button>
        )}
        {(job.status === 'scheduled' || job.status === 'in_progress') && (
          <button
            onClick={onManage}
            className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Wrench className="h-3 w-3" /> إدارة
          </button>
        )}
        {(job.status === 'completed' || job.status === 'cancelled') && (
          <button
            onClick={onManage}
            className="flex items-center gap-1.5 rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            عرض التفاصيل
          </button>
        )}
      </div>
    </div>
  );
}

function AcceptRequestModal({
  request,
  onClose,
  onAccepted,
}: {
  request: MechanicRequest;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleAccept() {
    setSaving(true);
    const carInfoStr = request.car_info || 'سيارة غير محددة';

    await supabase
      .from('mechanic_requests')
      .update({ status: 'accepted' as RequestStatus, mechanic_notes: notes || null })
      .eq('id', request.id);

    await supabase.from('repair_jobs').insert({
      request_id: request.id,
      owner_name: request.owner_name,
      car_info: carInfoStr,
      system_name: request.system_name,
      status: 'scheduled' as JobStatus,
      scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
      estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
      notes: notes || null,
    });

    setSaving(false);
    onAccepted();
  }

  return (
    <ModalShell title="قبول الطلب" onClose={onClose}>
      <div className="mb-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
        <p className="font-semibold text-gray-900 dark:text-white">{request.system_name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {request.car_info} — {request.owner_name}
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">موعد الجدولة</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">التكلفة المقدرة (ريال)</label>
          <input
            type="number"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            placeholder="مثل: 350"
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات لصاحب السيارة</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="مثل: يرجى إحضار السيارة في الموعد المحدد..."
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={handleAccept}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {saving ? 'جاري القبول...' : 'قبول وإنشاء مهمة'}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          إلغاء
        </button>
      </div>
    </ModalShell>
  );
}

function DeclineRequestModal({
  request,
  onClose,
  onDeclined,
}: {
  request: MechanicRequest;
  onClose: () => void;
  onDeclined: () => void;
}) {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleDecline() {
    setSaving(true);
    await supabase
      .from('mechanic_requests')
      .update({ status: 'declined' as RequestStatus, mechanic_notes: reason || 'تم الرفض من قبل الميكانيكي' })
      .eq('id', request.id);
    setSaving(false);
    onDeclined();
  }

  return (
    <ModalShell title="رفض الطلب" onClose={onClose}>
      <div className="mb-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
        <p className="font-semibold text-gray-900 dark:text-white">{request.system_name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {request.car_info} — {request.owner_name}
        </p>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">السبب (اختياري)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="مثل: غير قادر على صيانة هذا النظام..."
          className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={handleDecline}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          {saving ? 'جاري الرفض...' : 'رفض الطلب'}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          إلغاء
        </button>
      </div>
    </ModalShell>
  );
}

function ManageJobModal({
  job,
  onClose,
  onUpdated,
}: {
  job: RepairJob;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState<JobStatus>(job.status);
  const [scheduledDate, setScheduledDate] = useState(
    job.scheduled_date ? new Date(job.scheduled_date).toISOString().slice(0, 16) : '',
  );
  const [estimatedCost, setEstimatedCost] = useState(job.estimated_cost?.toString() ?? '');
  const [actualCost, setActualCost] = useState(job.actual_cost?.toString() ?? '');
  const [notes, setNotes] = useState(job.notes ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await supabase
      .from('repair_jobs')
      .update({
        status,
        scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
        actual_cost: actualCost ? parseFloat(actualCost) : null,
        notes: notes || null,
      })
      .eq('id', job.id);
    setSaving(false);
    onUpdated();
  }

  return (
    <ModalShell title="إدارة مهمة الإصلاح" onClose={onClose}>
      <div className="mb-4 rounded-xl bg-gray-50 p-3 dark:bg-gray-900/50">
        <p className="font-semibold text-gray-900 dark:text-white">{job.system_name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {job.car_info} — {job.owner_name}
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">حالة المهمة</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as JobStatus)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="scheduled">مجدول</option>
            <option value="in_progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">موعد الجدولة</label>
          <input
            type="datetime-local"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">التكلفة المقدرة</label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">التكلفة الفعلية</label>
            <input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">ملاحظات</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-autofix-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-autofix-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
        <button
          onClick={onClose}
          className="rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          إلغاء
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
