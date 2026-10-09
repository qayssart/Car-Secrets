import { useState, useMemo } from 'react';
import { Search, AlertTriangle, Wrench, Zap } from 'lucide-react';
import { obdCodes } from '@/data/obdCodes';
import { SeverityBadge } from '@/components/ui/Badges';

export function OBDCodeLookup() {
  const [query, setQuery] = useState('');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!query.trim()) return obdCodes;
    const q = query.toUpperCase().trim();
    return obdCodes.filter(
      (c) =>
        c.code.includes(q) ||
        c.system.includes(query.trim()) ||
        c.description.includes(query.trim()),
    );
  }, [query]);

  const selected = obdCodes.find((c) => c.code === selectedCode);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">بحث أكواد أعطال OBD-II</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          ابحث عن أكواد الأعطال لعرض الشرح ومستوى الخطورة والإصلاحات الموصى بها.
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="أدخل كود (مثل P0300) أو كلمة بحث..."
          className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pr-11 pl-4 text-sm text-gray-900 placeholder-gray-400 focus:border-autofix-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Code list */}
        <div className="space-y-2">
          {results.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400">لا توجد أكواد مطابقة لـ "{query}".</p>
            </div>
          ) : (
            results.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCode(c.code)}
                className={`w-full rounded-xl border-2 p-3 text-right transition-all ${
                  selectedCode === c.code
                    ? 'border-autofix-500 bg-autofix-50 dark:border-autofix-500 dark:bg-autofix-900/20'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <code className="rounded-md bg-gray-100 px-2 py-0.5 text-sm font-bold text-autofix-700 dark:bg-gray-700 dark:text-autofix-400" dir="ltr">
                      {c.code}
                    </code>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.system}</span>
                  </div>
                  <SeverityBadge severity={c.severity} />
                </div>
                <p className="mt-1.5 text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{c.description}</p>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-4">
          {selected ? (
            <div className="animate-fade-in rounded-xl border-2 border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="rounded-lg bg-autofix-100 px-3 py-1 text-lg font-bold text-autofix-700 dark:bg-autofix-900/40 dark:text-autofix-400" dir="ltr">
                    {selected.code}
                  </code>
                  <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {selected.system}
                  </span>
                </div>
                <SeverityBadge severity={selected.severity} />
              </div>
              <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">{selected.description}</h3>

              <div className="mb-4">
                <div className="mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">الأسباب المحتملة</p>
                </div>
                <ul className="space-y-1.5">
                  {selected.causes.map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">الإصلاحات الموصى بها</p>
                </div>
                <ul className="space-y-1.5">
                  {selected.fixes.map((fix, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      {fix}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <Zap className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                اختر كودًا من القائمة لعرض تفاصيله الكاملة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
