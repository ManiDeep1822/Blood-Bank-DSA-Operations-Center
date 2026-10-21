import React from 'react';
import { Database, Users, AlertTriangle, ShieldCheck, ArrowRight, Clock, Plus, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

export default function OverviewView({ stats, stock, requests, onNavigate, onOpenDonate, onOpenRequest }) {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Top Operations KPI Grid - Strictly Equal Height & Padding */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Total Stock */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total Blood Inventory</span>
              <Database className="w-4 h-4 text-red-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{stats?.totalUnits ?? 0}</span>
              <span className="text-xs text-slate-500 font-medium">certified units available</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-700">Chronological FIFO Shelf-Life Protocol</span>
          </div>
        </div>

        {/* Metric 2: Registered Donors */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Registered Donors</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{stats?.donorCount ?? 0}</span>
              <span className="text-xs text-slate-500 font-medium">active volunteer profiles</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="font-semibold text-blue-700">Indexed for Instant Record Retrieval</span>
          </div>
        </div>

        {/* Metric 3: Active Requests */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Pending Triage Orders</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{stats?.pendingRequestsCount ?? 0}</span>
              <span className="text-xs text-slate-500 font-medium">awaiting transfusion dispatch</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <Activity className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-semibold text-amber-700">Clinical Emergency Prioritization Active</span>
          </div>
        </div>

        {/* Metric 4: Universal Donor Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between min-h-[145px]">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Universal Donor (O-) Units</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900">{stock?.['O-']?.length ?? 0}</span>
              <span className="text-xs text-slate-500 font-medium">units ready for immediate release</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-mono text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700">Emergency Universal Fallback Reserve</span>
          </div>
        </div>
      </div>

      {/* 8-Channel Blood Inventory Grid - Uniform Dimensions & Zero Text Override */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Blood Group Inventory Matrix (8 Dedicated Storage Channels)
            </h2>
            <p className="text-xs text-slate-500">
              Each channel operates on First-In First-Out protocol. Oldest certified bag is always selected first.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenDonate}
              className="px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Donation</span>
            </button>
            <button
              onClick={() => onNavigate('stock')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Inspect All Channels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 8 Balanced Cards with Equal Height & No Overrides */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3.5">
          {bloodGroups.map((bg) => {
            const count = stock?.[bg]?.length ?? 0;
            const oldest = stock?.[bg]?.[0];
            const isCritical = count === 0;
            const isLow = count === 1;

            return (
              <div
                key={bg}
                className={`border rounded-lg p-3.5 text-center flex flex-col justify-between min-h-[150px] transition-all ${
                  isCritical
                    ? 'border-red-300 bg-red-50/50'
                    : isLow
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                {/* Row 1: Group Name & Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-red-600">{bg}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isCritical
                        ? 'bg-red-200 text-red-800'
                        : isLow
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isCritical ? 'EMPTY' : isLow ? 'LOW' : 'READY'}
                  </span>
                </div>

                {/* Row 2: Unit Quantity */}
                <div className="my-2">
                  <div className="text-2xl font-bold font-mono text-slate-900">{count}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">Units Stored</div>
                </div>

                {/* Row 3: Next Unit & Expiry Info (Zero Overlap) */}
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 font-mono">
                  {oldest ? (
                    <div>
                      <div className="font-semibold text-slate-700 truncate">Next: #{oldest.unitId}</div>
                      <div className="text-slate-400 text-[9px] truncate mt-0.5">Exp: {oldest.expiryDate}</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No inventory</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Section: Emergency Triage Snapshot & Clinical Guarantees - Equal Heights */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active Emergency Requests Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Active Clinical Triage Queue
                </h3>
                <p className="text-xs text-slate-500">Highest-urgency order is dispatched first</p>
              </div>
              <button
                onClick={onOpenRequest}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit Order</span>
              </button>
            </div>

            {requests && requests.length > 0 ? (
              <div className="space-y-2.5">
                {requests.slice(0, 4).map((req, index) => (
                  <div
                    key={req.requestId}
                    className="flex items-center justify-between p-3 rounded border border-slate-200 bg-slate-50/70 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-200 font-mono font-bold text-[10px] flex items-center justify-center text-slate-700 shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{req.patientName}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-red-600 font-mono font-bold">{req.bloodGroupNeeded}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Order #{req.requestId} &middot; Volume: {req.unitsNeeded} unit(s)
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono shrink-0 ${
                        req.urgency === 3
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : req.urgency === 2
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {req.urgency === 3 ? 'CRITICAL' : req.urgency === 2 ? 'URGENT' : 'ROUTINE'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                <Clock className="w-6 h-6 mb-1 text-slate-300" />
                <span>No pending transfusion orders in triage queue.</span>
              </div>
            )}
          </div>

          {requests && requests.length > 4 && (
            <div className="text-center pt-3 text-xs text-slate-500 border-t border-slate-100 mt-3">
              + {requests.length - 4} additional patient orders currently queued
            </div>
          )}
        </div>

        {/* Right: Operational Protocols Panel */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2 pb-2 border-b border-slate-100">
              Clinical Transfusion Protocols
            </h3>
            <div className="space-y-3 text-xs mt-3">
              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>1. Logarithmic Donor Record Directory</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Donor profiles are indexed via balanced tree hierarchies keyed by numerical donor identification. Enables instant retrieval and verified eligibility validation.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>2. Strict Chronological Inventory Control</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Every blood channel operates on First-In First-Out discipline. When blood is requisitioned, the earliest-collected certified unit is dispensed first to prevent shelf expiration.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>3. Priority Emergency Dispatch Protocol</span>
                </div>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Patient requests are triaged by medical severity (Critical Trauma &gt; Urgent Surgery &gt; Routine Procedure). Highest-acuity patients are dispatched first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
