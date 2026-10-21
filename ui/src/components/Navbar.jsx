import React from 'react';
import { Activity, Users, Database, AlertCircle, CheckSquare, Clock, HeartPulse, FileDown } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, stats }) {
  const tabs = [
    { id: 'overview', label: 'Operations Dashboard', icon: Activity, count: null },
    { id: 'donors', label: 'Donor Registry', icon: Users, count: stats?.donorCount ?? 0 },
    { id: 'stock', label: 'Blood Inventory', icon: Database, count: stats?.totalUnits ?? 0 },
    { id: 'triage', label: 'Emergency Triage', icon: AlertCircle, count: stats?.pendingRequestsCount ?? 0 },
    { id: 'dispense', label: 'Clinical Dispense', icon: CheckSquare, count: null },
  ];

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Top Clinical Header Bar - 100% Width */}
      <div className="w-full px-6 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Medical Cross SVG Icon */}
          <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                TRANSFUSION MEDICINE OPERATIONS CENTER
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-semibold">
                SYSTEM ONLINE
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Department of Blood Transfusion &amp; Hematology</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Regional Blood Inventory &amp; Emergency Dispatch</span>
            </div>
          </div>
        </div>

        {/* Real-time Telemetry Status */}
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-700 font-medium">CORE ENGINE ACTIVE</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>PORT 5000 SYNCHRONIZED</span>
          </div>

          <div className="bg-red-50 text-red-700 px-3 py-1.5 rounded border border-red-200 font-semibold flex items-center gap-2 shadow-2xs">
            <HeartPulse className="w-3.5 h-3.5 text-red-600" />
            <span>STOCK ON HAND:</span>
            <span className="text-sm font-bold">{stats?.totalUnits ?? 0} UNITS</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs - 100% Width */}
      <div className="w-full px-6 flex items-center justify-between gap-4 overflow-x-auto bg-slate-50/70 py-1.5">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive
                        ? 'bg-slate-100 text-slate-800 border border-slate-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <a
          href="/api/download-presentation"
          download="Blood_Bank_DSA_Executive_Presentation.pptx"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-900 transition shadow-xs whitespace-nowrap cursor-pointer shrink-0"
        >
          <FileDown className="w-3.5 h-3.5 text-slate-300" />
          <span>Executive Deck (.pptx)</span>
        </a>
      </div>
    </header>
  );
}
