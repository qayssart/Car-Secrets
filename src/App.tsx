import { useState, type ReactNode } from 'react';
import {
  ArrowLeftRight,
  Car,
  ClipboardList,
  Inbox,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
  Wrench,
} from 'lucide-react';
import { DiagnosticWizard } from '@/components/DiagnosticWizard';
import { MechanicDashboard } from '@/components/MechanicDashboard';
import { OBDCodeLookup } from '@/components/OBDCodeLookup';
import { OwnerDashboard } from '@/components/OwnerDashboard';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import type { Role } from '@/types';

type OwnerPage = 'wizard' | 'obd' | 'dashboard';
type MechanicPage = 'requests' | 'obd' | 'dashboard';

function AppContent() {
  const { theme, toggleTheme } = useTheme();
  const [role, setRole] = useState<Role | null>(null);
  const [ownerName, setOwnerName] = useState('');
  const [carInfo, setCarInfo] = useState({ make: '', model: '', year: '' });
  const [profileSetup, setProfileSetup] = useState(false);
  const [ownerPage, setOwnerPage] = useState<OwnerPage>('wizard');
  const [mechanicPage, setMechanicPage] = useState<MechanicPage>('requests');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function resetSession() {
    setRole(null);
    setProfileSetup(false);
    setOwnerName('');
    setCarInfo({ make: '', model: '', year: '' });
  }

  if (!role) {
    return (
      <div className="min-h-screen overflow-hidden bg-[#f7f8fa] text-slate-900 dark:bg-slate-950 dark:text-white">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:pt-14">
          <section className="relative overflow-hidden rounded-[2rem] bg-[#101a2c] px-6 py-10 text-white shadow-2xl shadow-slate-300/40 sm:px-12 sm:py-14">
            <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-36 right-0 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> تشخيص أذكى، تصليح أسهل
                </div>
                <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.15] sm:text-6xl">أسرار السيارات، يمّك بكل خطوة</h1>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                  تطبيق عراقي يساعدك تفهم عطل سيارتك، تعرف الحل المناسب، وتوصل لميكانيكي يعرف شغله.
                </p>
                <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-200">
                  <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-300" /> معلومات مرتبة وواضحة</span>
                  <span className="flex items-center gap-2"><Wrench className="h-4 w-4 text-amber-300" /> لأصحاب السيارات والميكانيكية</span>
                </div>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="logo-ring rounded-full bg-white p-3 shadow-2xl shadow-black/30">
                  <img src="/اسرار_السيارات copy.jpg" alt="شعار أسرار السيارات" className="h-52 w-52 rounded-full object-cover sm:h-64 sm:w-64" />
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10">
            <div className="text-center">
              <p className="text-sm font-bold tracking-wide text-blue-600 dark:text-blue-400">خل نبدي</p>
              <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">إنت صاحب سيارة لو ميكانيكي؟</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">اختار المسار المناسب، والباقي نرتبه إلك.</p>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <RoleCard icon={User} title="أنا صاحب سيارة" description="شخّص العطل، فتّش عن كود الفحص، وخلي طلبك يوصل للميكانيكي." accent="blue" onClick={() => setRole('owner')} />
              <RoleCard icon={Wrench} title="أنا ميكانيكي" description="استلم طلبات الزبائن، راجع تفاصيل العطل، ونظّم شغلك بسهولة." accent="amber" onClick={() => setRole('mechanic')} />
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!profileSetup) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] dark:bg-slate-950">
        <Header theme={theme} onToggleTheme={toggleTheme} onRoleSwitch={resetSession} />
        <main className="mx-auto max-w-lg px-4 py-12">
          <div className="mb-8 text-center">
            <img src="/اسرار_السيارات copy.jpg" alt="أسرار السيارات" className="mx-auto h-20 w-20 rounded-2xl object-cover shadow-lg" />
            <h1 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">{role === 'owner' ? 'خل نتعرف على سيارتك' : 'هلا بالميكانيكي'}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{role === 'owner' ? 'معلومات بسيطة حتى نخلي التشخيص أدق إلك.' : 'من هنا تتابع طلبات الزبائن ومهام التصليح.'}</p>
          </div>
          {role === 'owner' ? (
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
              <Field label="اسمك" value={ownerName} onChange={setOwnerName} placeholder="مثلاً: علي" />
              <div className="grid grid-cols-2 gap-3"><Field label="الماركة" value={carInfo.make} onChange={(value) => setCarInfo({ ...carInfo, make: value })} placeholder="تويوتا" /><Field label="الموديل" value={carInfo.model} onChange={(value) => setCarInfo({ ...carInfo, model: value })} placeholder="كامري" /></div>
              <Field label="سنة الصنع" value={carInfo.year} onChange={(value) => setCarInfo({ ...carInfo, year: value })} placeholder="2019" />
              <button onClick={() => setProfileSetup(true)} className="w-full rounded-2xl bg-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">يلا نبدأ</button>
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"><button onClick={() => setProfileSetup(true)} className="w-full rounded-2xl bg-amber-500 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-amber-400">دخول لوحة الميكانيكي</button></div>
          )}
          <button onClick={resetSession} className="mt-5 flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"><ArrowLeftRight className="h-4 w-4" /> تغيير الاختيار</button>
        </main>
      </div>
    );
  }

  const isOwner = role === 'owner';
  const navItems = isOwner
    ? [{ id: 'wizard' as OwnerPage, label: 'شخّص العطل', icon: ClipboardList }, { id: 'obd' as OwnerPage, label: 'أكواد الفحص', icon: Search }, { id: 'dashboard' as OwnerPage, label: 'سجلاتي', icon: Car }]
    : [{ id: 'requests' as MechanicPage, label: 'طلبات الزبائن', icon: Inbox }, { id: 'obd' as MechanicPage, label: 'أكواد الفحص', icon: Search }, { id: 'dashboard' as MechanicPage, label: 'مهام التصليح', icon: Wrench }];

  return (
    <div className="min-h-screen bg-[#f7f8fa] dark:bg-slate-950">
      <Header theme={theme} onToggleTheme={toggleTheme} onRoleSwitch={resetSession} roleLabel={isOwner ? 'صاحب سيارة' : 'ميكانيكي'} roleIcon={isOwner ? User : Wrench} />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-60 shrink-0 md:block"><div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center gap-3 border-b border-slate-100 px-3 pb-4 dark:border-slate-800"><img src="/اسرار_السيارات copy.jpg" alt="" className="h-10 w-10 rounded-xl object-cover" /><div><p className="font-extrabold">أسرار السيارات</p><p className="text-xs text-slate-400">خدمة سيارتك</p></div></div>{navItems.map((item) => { const Icon = item.icon; const active = isOwner ? ownerPage === item.id : mechanicPage === item.id; return <button key={item.id} onClick={() => isOwner ? setOwnerPage(item.id as OwnerPage) : setMechanicPage(item.id as MechanicPage)} className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</div></aside>
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{isOwner && ownerPage === 'wizard' && <Panel><DiagnosticWizard ownerName={ownerName} carInfo={carInfo} onComplete={() => undefined} onSaved={() => setRefreshTrigger((value) => value + 1)} /></Panel>}{isOwner && ownerPage === 'obd' && <Panel><OBDCodeLookup /></Panel>}{isOwner && ownerPage === 'dashboard' && <OwnerDashboard ownerName={ownerName} carInfo={carInfo} refreshTrigger={refreshTrigger} />}{!isOwner && mechanicPage === 'requests' && <MechanicDashboard />}{!isOwner && mechanicPage === 'obd' && <Panel><OBDCodeLookup /></Panel>}{!isOwner && mechanicPage === 'dashboard' && <MechanicDashboard />}</main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-2 backdrop-blur md:hidden dark:border-slate-800 dark:bg-slate-900/95"><div className="mx-auto flex max-w-lg">{navItems.map((item) => { const Icon = item.icon; const active = isOwner ? ownerPage === item.id : mechanicPage === item.id; return <button key={item.id} onClick={() => isOwner ? setOwnerPage(item.id as OwnerPage) : setMechanicPage(item.id as MechanicPage)} className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}><Icon className="h-5 w-5" />{item.label}</button>; })}</div></nav>
    </div>
  );
}

function RoleCard({ icon: Icon, title, description, accent, onClick }: { icon: typeof User; title: string; description: string; accent: 'blue' | 'amber'; onClick: () => void }) {
  return <button onClick={onClick} className="group rounded-3xl border border-slate-200 bg-white p-6 text-right shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"><div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${accent === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300'}`}><Icon className="h-7 w-7" /></div><h3 className="text-xl font-extrabold">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-500 dark:text-slate-400">{description}</p><span className="mt-5 inline-flex text-sm font-bold text-blue-600 transition group-hover:gap-3 dark:text-blue-400">ادخل للتطبيق ←</span></button>;
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-900" /></label>; }

function Panel({ children }: { children: ReactNode }) { return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">{children}</div>; }

function Header({ theme, onToggleTheme, onRoleSwitch, roleLabel, roleIcon: RoleIcon }: { theme: 'light' | 'dark'; onToggleTheme: () => void; onRoleSwitch?: () => void; roleLabel?: string; roleIcon?: typeof Wrench }) {
  return <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6"><div className="flex items-center gap-3"><img src="/اسرار_السيارات copy.jpg" alt="شعار أسرار السيارات" className="h-10 w-10 rounded-xl object-cover shadow-sm" /><div><p className="text-base font-extrabold leading-tight">أسرار السيارات</p><p className="text-[11px] font-semibold text-slate-400">دليلك للصيانة بالعراقي</p></div></div><div className="flex items-center gap-2">{roleLabel && RoleIcon && <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 sm:flex"><RoleIcon className="h-3.5 w-3.5" />{roleLabel}</span>}<button onClick={onToggleTheme} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="تبديل المظهر">{theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}</button>{onRoleSwitch && <button onClick={onRoleSwitch} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><ArrowLeftRight className="h-3.5 w-3.5" /><span className="hidden sm:inline">تبديل المستخدم</span></button>}</div></div></header>;
}

export default function App() { return <ThemeProvider><AppContent /></ThemeProvider>; }
