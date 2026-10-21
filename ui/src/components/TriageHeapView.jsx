import React, { useState } from 'react';
import { AlertTriangle, Plus, GitBranch, Layers, Clock, X, CheckCircle2 } from 'lucide-react';
import TreeVisualizer from './TreeVisualizer';

export default function TriageHeapView({ requests, heapTree, heapArray, onSubmitRequest }) {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'heap'
  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [unitsNeeded, setUnitsNeeded] = useState(1);
  const [urgency, setUrgency] = useState(3); // Default Critical
  const [modalError, setModalError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!patientName.trim()) {
      setModalError('Patient identification is required.');
      return;
    }

    const success = await onSubmitRequest({
      patientName: patientName.trim(),
      bloodGroupNeeded: bloodGroup,
      unitsNeeded: parseInt(unitsNeeded, 10),
      urgency: parseInt(urgency, 10)
    });

    if (success) {
      setShowModal(false);
      setPatientName('');
      setUnitsNeeded(1);
      setUrgency(3);
      setModalError('');
    } else {
      setModalError('Failed to queue request. Please verify server connection.');
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header and Control Bar - 100% Width */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            EMERGENCY TRIAGE DISPATCH QUEUE
          </h2>
          <p className="text-xs text-slate-500">
            Transfusion orders are triaged in memory by patient acuity level (Critical &gt; Urgent &gt; Routine). Arrival timestamp acts as tie-breaker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Priority Dispatch Line
            </button>
            <button
              onClick={() => setViewMode('heap')}
              className={`px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'heap' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Priority Tree</span>
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Submit Blood Order</span>
          </button>
        </div>
      </div>

      {/* Heap Visualizer View */}
      {viewMode === 'heap' ? (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Priority Tree Visual Topology
              </h3>
              <p className="text-xs text-slate-500">
                Root element holds the highest priority clinical emergency. Parent node &ge; descendant child nodes.
              </p>
            </div>
            <TreeVisualizer root={heapTree} type="heap" />
          </div>

          {/* Underlying Array Buffer Representation - Strictly Equal Card Dimensions */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
              Internal Array Buffer Representation
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sequential array storage: Root is positioned at Index [0]. Parent at index i, left child at 2i + 1, right child at 2i + 2.
            </p>

            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-3">
                {heapArray && heapArray.length > 0 ? (
                  heapArray.map((item, idx) => (
                    <div
                      key={idx}
                      className={`shrink-0 w-44 min-w-[176px] h-[115px] border rounded-lg p-3 text-xs font-mono text-center flex flex-col justify-between ${
                        idx === 0 ? 'border-red-400 bg-red-50/60 shadow-xs ring-1 ring-red-300' : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div className="text-[10px] text-slate-400 font-semibold">
                        Index [{idx}] {idx === 0 ? '(ROOT)' : ''}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 truncate my-0.5">Order #{item.requestId}</div>
                        <div className="text-xs font-extrabold text-red-600">{item.bloodGroupNeeded} ({item.unitsNeeded}u)</div>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate pt-1 border-t border-slate-200/60">
                        {item.urgencyLabel?.split(' ')[0]}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded">
                    Buffer currently empty. No active patient orders.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Priority Table View with Generous Spacing and Zero Text Collisions */
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Triage Priority Sequence ({requests.length} Orders in Queue)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              Arranged by Clinical Acuity &bull; Level 3 (Critical) &gt; Level 2 (Urgent) &gt; Level 1 (Routine)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5 font-bold">Rank</th>
                  <th className="py-3 px-5 font-bold">Order ID</th>
                  <th className="py-3 px-5 font-bold">Patient / Identifier</th>
                  <th className="py-3 px-5 font-bold">Blood Group</th>
                  <th className="py-3 px-5 font-bold">Volume</th>
                  <th className="py-3 px-5 font-bold">Clinical Severity</th>
                  <th className="py-3 px-5 font-bold">Arrival Order</th>
                  <th className="py-3 px-5 text-right font-bold">Dispatch Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {requests.map((req, index) => {
                  const isRoot = index === 0;
                  return (
                    <tr
                      key={req.requestId}
                      className={`transition ${isRoot ? 'bg-red-50/40 hover:bg-red-50/60' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono font-bold text-xs ${
                            isRoot ? 'bg-red-600 text-white shadow-2xs' : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono font-bold text-slate-900">#{req.requestId}</td>
                      <td className="py-3 px-5 font-semibold text-slate-800">{req.patientName}</td>
                      <td className="py-3 px-5">
                        <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-red-100 text-red-800 border border-red-200">
                          {req.bloodGroupNeeded}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono font-bold text-slate-900">{req.unitsNeeded} unit(s)</td>
                      <td className="py-3 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                            req.urgency === 3
                              ? 'bg-red-100 text-red-800 border border-red-300'
                              : req.urgency === 2
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {req.urgencyLabel || (req.urgency === 3 ? 'CRITICAL' : req.urgency === 2 ? 'URGENT' : 'ROUTINE')}
                        </span>
                      </td>
                      <td className="py-3 px-5 font-mono text-slate-500 text-[11px]">Sequence #{req.timestamp}</td>
                      <td className="py-3 px-5 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold font-mono border ${
                          isRoot
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {isRoot ? 'NEXT IN LINE' : 'QUEUED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {requests.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                      No pending transfusion orders in priority line.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submit Request Modal with SVG Close Icon */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Submit Patient Blood Order
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Name / Clinical ID</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Eleanor Rigby (ICU Room 4)"
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group Requisitioned</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-bold font-mono"
                  >
                    {bloodGroups.map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Volume (Units)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={unitsNeeded}
                    onChange={(e) => setUnitsNeeded(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Acuity / Severity Level</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold"
                >
                  <option value={3}>Level 3: CRITICAL (Active Trauma / ICU / Severe Hemorrhage)</option>
                  <option value={2}>Level 2: URGENT (Surgery scheduled within 24h / Severe Anemia)</option>
                  <option value={1}>Level 1: ROUTINE (Planned Transfusion / Stable Condition)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  High-acuity emergency orders automatically advance to the root of the dispatch line.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition cursor-pointer shadow-xs"
                >
                  Confirm &amp; Queue Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
