import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, AlertCircle, FileText, RefreshCw, ArrowRight, Activity, Check, X } from 'lucide-react';

export default function DispenseAuditView({ requests, stock, auditLog, onFulfillRequest, onRefresh }) {
  const [lastReceipt, setLastReceipt] = useState(null);
  const [fulfillError, setFulfillError] = useState('');
  const [fulfilling, setFulfilling] = useState(false);

  const nextReq = requests && requests.length > 0 ? requests[0] : null;

  // Medical compatibility reference
  const compatibilityRules = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };

  const handleFulfill = async () => {
    setFulfillError('');
    setFulfilling(true);
    try {
      const res = await onFulfillRequest();
      if (res && res.success) {
        setLastReceipt(res);
      } else if (res && res.error) {
        setFulfillError(res.error);
      }
    } catch (err) {
      setFulfillError(err.message || 'Dispensation error occurred');
    } finally {
      setFulfilling(false);
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header - 100% Width */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            CLINICAL DISPENSE PROTOCOL &amp; AUDIT LEDGER
          </h2>
          <p className="text-xs text-slate-500">
            Request release verifies blood compatibility rules, dequeues certified units from inventory in chronological order, and writes immutable audit logs.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3.5 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Main Split Grid: 50/50 Equal Width & Equal Height */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column (50% Width): Active Patient Order Dispatcher */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Next Patient Order in Queue
                </h3>
                <p className="text-xs text-slate-500">
                  Awaiting immediate chronological release based on triage priority
                </p>
              </div>
              {nextReq && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200 shrink-0">
                  DISPATCH ROOT #{nextReq.requestId}
                </span>
              )}
            </div>

            {nextReq ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Patient Identifier:</span>
                    <span className="font-bold text-slate-900">{nextReq.patientName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Requisitioned Group:</span>
                    <span className="font-extrabold text-red-600 font-mono text-base">{nextReq.bloodGroupNeeded}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Volume Required:</span>
                    <span className="font-bold font-mono text-slate-900">{nextReq.unitsNeeded} Unit(s)</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Triage Priority:</span>
                    <span className="font-bold font-mono text-red-700">{nextReq.urgencyLabel}</span>
                  </div>
                </div>

                {/* Compatibility Preview */}
                <div className="text-xs">
                  <div className="text-slate-600 font-semibold mb-1.5">Acceptable Transfusion Donor Groups:</div>
                  <div className="flex flex-wrap gap-1.5 font-mono">
                    {compatibilityRules[nextReq.bloodGroupNeeded]?.map(bg => (
                      <span
                        key={bg}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                          bg === nextReq.bloodGroupNeeded
                            ? 'bg-red-600 text-white border-red-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {bg} {bg === nextReq.bloodGroupNeeded ? '(Exact Match)' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {fulfillError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{fulfillError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                <span className="font-semibold text-slate-700">All patient orders have been fulfilled.</span>
                <span className="text-slate-400 text-[11px] mt-0.5">Triage dispatch queue is clear.</span>
              </div>
            )}
          </div>

          {nextReq && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={handleFulfill}
                disabled={fulfilling}
                className="w-full py-3 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{fulfilling ? 'Executing Chronological Release...' : 'Authorize & Release Blood Units'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column (50% Width): Full Audit Ledger */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Clinical Activity &amp; Traceability Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable chronological log of donor entries, inventory additions, and patient releases
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 font-semibold shrink-0">
                {auditLog?.length ?? 0} Events Verified
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] lg:max-h-[420px] overflow-y-auto pr-1">
              {auditLog && auditLog.length > 0 ? (
                auditLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded border border-slate-200 bg-slate-50/60 text-xs font-mono text-slate-800 flex items-start gap-2.5 hover:bg-slate-50 transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1"></span>
                    <div className="leading-relaxed">{log}</div>
                  </div>
                ))
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                  <Activity className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="font-semibold text-slate-600">No activity logged in current operational session.</span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>AUDIT INTEGRITY: VERIFIED</span>
            <span>REAL-TIME TELEMETRY</span>
          </div>
        </div>
      </div>

      {/* Dedicated Full-Width Transfusion Release Certificate */}
      {lastReceipt && (
        <div className="w-full bg-emerald-50/60 border border-emerald-300 rounded-lg p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2.5 border-b border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm uppercase tracking-wide">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Transfusion Release Certificate (Official Dispensation Record)</span>
            </div>
            <button
              onClick={() => setLastReceipt(null)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Dismiss Certificate</span>
            </button>
          </div>

          <div className="bg-white p-4 rounded border border-emerald-200 font-mono text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Requisition Summary</div>
              <div className="text-slate-900 font-bold">Order #{lastReceipt.request?.requestId} Authenticated &amp; Released</div>
              <div className="text-slate-600 mt-0.5">Patient: {lastReceipt.request?.patientName}</div>
              <div className="text-slate-600">Requisition: {lastReceipt.request?.unitsNeeded}x {lastReceipt.request?.bloodGroupNeeded}</div>
            </div>

            <div className="md:col-span-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Dispensed Certified Units</div>
              <div className="space-y-1.5">
                {lastReceipt.dispensedUnits?.map(u => (
                  <div key={u.unitId} className="flex flex-wrap justify-between items-center py-1.5 px-3 rounded bg-slate-50 border border-slate-200 text-slate-800">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Unit #{u.unitId}</span>
                      <span className="text-slate-300">|</span>
                      <span>Blood Group: {u.bloodGroup}</span>
                    </span>
                    <span className={u.isExactMatch ? 'text-emerald-700 font-bold text-[11px]' : 'text-amber-700 font-bold text-[11px]'}>
                      {u.isExactMatch ? 'Exact Compatibility Match' : 'Universal Fallback Match'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
