import { useState } from 'react';
import {
  Cog,
  Thermometer,
  Disc,
  GitBranch,
  Settings2,
  Zap,
  Snowflake,
  Wind,
  Fuel,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  Save,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { diagnosticSystems } from '@/data/diagnosticSystems';
import type { CauseFix, DiagnosticSystem, Severity } from '@/types';
import { highestSeverity } from '@/lib/utils';
import { SeverityBadge } from '@/components/ui/Badges';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, typeof Cog> = {
  Cog,
  Thermometer,
  Disc,
  GitBranch,
  Settings2,
  Zap,
  Snowflake,
  Wind,
  Fuel,
};

interface WizardResult {
  system: DiagnosticSystem;
  selectedSymptoms: string[];
  followUpAnswers: Record<string, string>;
  causes: CauseFix[];
  severity: Severity;
}

interface DiagnosticWizardProps {
  onComplete: (log: WizardResult) => void;
  onSaved: () => void;
  ownerName: string;
  carInfo: { make: string; model: string; year: string };
}

type Step = 'system' | 'symptoms' | 'followups' | 'results' | 'saving';

export function DiagnosticWizard({ onComplete, onSaved, ownerName, carInfo }: DiagnosticWizardProps) {
  const [step, setStep] = useState<Step>('system');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const system = diagnosticSystems.find((s) => s.id === selectedSystemId) ?? null;

  const matchedCauses: CauseFix[] = (() => {
    if (!system) return [];
    const allCauses: CauseFix[] = [];
    for (const map of system.causeMap) {
      if (map.symptoms.some((s) => selectedSymptoms.includes(s))) {
        for (const c of map.causes) {
          if (!allCauses.some((existing) => existing.cause === c.cause)) {
            allCauses.push(c);
          }
        }
      }
    }
    return allCauses;
  })();

  const resultSeverity: Severity = highestSeverity(
    matchedCauses.length > 0 ? matchedCauses.map((c) => c.severity) : ['low'],
  );

  function resetWizard() {
    setStep('system');
    setSelectedSystemId(null);
    setSelectedSymptoms([]);
    setFollowUpAnswers({});
    setNotes('');
    setSaveError(null);
  }

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  }

  async function handleSave() {
    if (!system) return;
    setIsSaving(true);
    setSaveError(null);

    const logData = {
      owner_name: ownerName || 'مستخدم',
      car_make: carInfo.make || null,
      car_model: carInfo.model || null,
      car_year: carInfo.year || null,
      system_name: system.name,
      symptoms: selectedSymptoms,
      follow_up_answers: followUpAnswers,
      causes: matchedCauses,
      severity: resultSeverity,
      notes: notes || null,
    };

    const { error } = await supabase.from('diagnostic_logs').insert(logData);
    setIsSaving(false);

    if (error) {
      setSaveError('تعذر حفظ سجل التشخيص. يرجى المحاولة مرة أخرى.');
      return;
    }

    onComplete({
      system,
      selectedSymptoms,
      followUpAnswers,
      causes: matchedCauses,
      severity: resultSeverity,
    });
    onSaved();
    resetWizard();
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {['system', 'symptoms', 'followups', 'results'].map((s, idx) => {
          const stepOrder = ['system', 'symptoms', 'followups', 'results', 'saving'];
          const currentIdx = stepOrder.indexOf(step);
          const isActive = idx === currentIdx;
          const isDone = idx < currentIdx;
          return (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-autofix-600 text-white'
                    : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              {idx < 3 && (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    isDone ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step: System Selection */}
      {step === 'system' && (
        <div className="animate-fade-in space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">اختر النظام</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              اختر نظام السيارة الذي تعاني منه مشكلة.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {diagnosticSystems.map((sys) => {
              const Icon = iconMap[sys.icon] ?? Cog;
              return (
                <button
                  key={sys.id}
                  onClick={() => {
                    setSelectedSystemId(sys.id);
                    setSelectedSymptoms([]);
                    setFollowUpAnswers({});
                    setStep('symptoms');
                  }}
                  className="group rounded-xl border-2 border-gray-200 bg-white p-4 text-right transition-all hover:border-autofix-400 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-autofix-500"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-autofix-50 text-autofix-600 transition-colors group-hover:bg-autofix-100 dark:bg-autofix-900/30 dark:text-autofix-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{sys.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sys.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Symptoms */}
      {step === 'symptoms' && system && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {system.name} — الأعراض
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                حدد جميع الأعراض التي تظهر.
              </p>
            </div>
            <button
              onClick={() => setStep('system')}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="h-4 w-4" /> رجوع
            </button>
          </div>
          <div className="space-y-2">
            {system.symptoms.map((symptom) => {
              const isSelected = selectedSymptoms.includes(symptom);
              return (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-right transition-all ${
                    isSelected
                      ? 'border-autofix-500 bg-autofix-50 dark:border-autofix-500 dark:bg-autofix-900/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
                      isSelected
                        ? 'border-autofix-500 bg-autofix-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{symptom}</span>
                </button>
              );
            })}
          </div>
          <button
            disabled={selectedSymptoms.length === 0}
            onClick={() => setStep('followups')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-autofix-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-autofix-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
          >
            متابعة <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step: Follow-ups */}
      {step === 'followups' && system && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">أسئلة متابعة</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ساعدنا في تضييق السبب المحتمل.
              </p>
            </div>
            <button
              onClick={() => setStep('symptoms')}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="h-4 w-4" /> رجوع
            </button>
          </div>
          <div className="space-y-4">
            {system.followUps.map((followUp, idx) => (
              <div
                key={idx}
                className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <p className="mb-3 font-medium text-gray-900 dark:text-white">{followUp.question}</p>
                <div className="flex flex-wrap gap-2">
                  {followUp.options.map((option) => {
                    const isSelected = followUpAnswers[followUp.question] === option;
                    return (
                      <button
                        key={option}
                        onClick={() =>
                          setFollowUpAnswers((prev) => ({ ...prev, [followUp.question]: option }))
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-autofix-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep('results')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-autofix-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-autofix-700 sm:w-auto sm:px-6"
          >
            عرض النتائج <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && system && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">نتائج التشخيص</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                بناءً على اختياراتك، إليك الأسباب المحتملة.
              </p>
            </div>
            <button
              onClick={() => setStep('followups')}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ChevronRight className="h-4 w-4" /> رجوع
            </button>
          </div>

          {/* Summary card */}
          <div className="rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">النظام المختار</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{system.name}</p>
              </div>
              <SeverityBadge severity={resultSeverity} />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">الأعراض</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedSymptoms.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {Object.keys(followUpAnswers).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">إجابات المتابعة</p>
                  <div className="mt-1 space-y-1">
                    {Object.entries(followUpAnswers).map(([q, a]) => (
                      <p key={q} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-gray-400">{q}</span> ← <span className="font-medium">{a}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Causes & fixes */}
          {matchedCauses.length > 0 ? (
            <div className="space-y-3">
              {matchedCauses.map((cause, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border-2 border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{cause.cause}</p>
                      </div>
                    </div>
                    <SeverityBadge severity={cause.severity} />
                  </div>
                  <div className="mr-7 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">الإصلاح الموصى به</p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{cause.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">
                لم يتم العثور على أسباب مطابقة للأعراض المختارة. جرّب اختيار أعراض أخرى.
              </p>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي تفاصيل أخرى عن المشكلة..."
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {saveError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {saveError}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> حفظ سجل التشخيص
                </>
              )}
            </button>
            <button
              onClick={resetWizard}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4" /> البدء من جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
