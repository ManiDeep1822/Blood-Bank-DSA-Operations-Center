import React, { useState } from 'react';
import { Database, Plus, ArrowRight, ShieldAlert, Check, X, CheckCircle2, Clock } from 'lucide-react';

export default function StockFIFOView({ stock, donors, onDonateBlood }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalError, setModalError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!selectedDonorId) {
      setModalError('Please select a registered volunteer donor.');
      return;
    }

    const success = await onDonateBlood({
      donorId: parseInt(selectedDonorId, 10),
      collectionDate
    });

    if (success) {
      setShowModal(false);
      setSelectedDonorId('');
      setModalError('');
    } else {
      setModalError('Failed to record blood unit. Please verify server connection.');
    }
  };

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header and Control Bar - 100% Width */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            BLOOD INVENTORY CHANNELS (CHRONOLOGICAL FIFO PROTOCOL)
          </h2>
          <p className="text-xs text-slate-500">
            Each blood group channel queues units chronologically. The earliest certified collection is always prioritized for dispatch.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record New Donation</span>
        </button>
      </div>

      {/* 8 Parallel FIFO Conveyors - Uniform Dimensions & Zero Text Overlap */}
      <div className="space-y-4">
        {bloodGroups.map((bg) => {
          const units = stock?.[bg] || [];
          const count = units.length;
          const isCritical = count === 0;
          const isLow = count === 1;

          return (
            <div
              key={bg}
              className={`bg-white border rounded-lg p-5 shadow-xs ${
                isCritical ? 'border-red-300' : isLow ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              {/* Channel Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded bg-red-50 text-red-700 font-extrabold font-mono text-sm flex items-center justify-center border border-red-200">
                    {bg}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">Channel {bg} Storage Rack</span>
                      <span
                        className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-red-100 text-red-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {count} CERTIFIED UNITS
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      Earliest collected bag dequeued first &bull; Expiration tracking verified
                    </span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">DISPATCH HEAD</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>

              {/* FIFO Conveyor Track with Fixed-Size Unit Cards */}
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-3.5 min-w-full">
                  {units.map((unit, idx) => {
                    const isHead = idx === 0;
                    return (
                      <div
                        key={unit.unitId}
                        className={`shrink-0 w-64 min-w-[256px] h-[130px] p-3.5 rounded-lg border text-xs flex flex-col justify-between ${
                          isHead
                            ? 'border-emerald-400 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-300/50'
                            : 'border-slate-200 bg-slate-50/70'
                        }`}
                      >
                        {/* Unit Card Header */}
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-900 text-sm">Unit #{unit.unitId}</span>
                          {isHead ? (
                            <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-2xs">
                              <Check className="w-2.5 h-2.5" />
                              <span>NEXT DISPATCH</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-medium">Donor #{unit.donorId}</span>
                          )}
                        </div>

                        {/* Mid Detail */}
                        <div className="text-[11px] text-slate-600 font-mono flex items-center justify-between">
                          <span className="text-slate-400">Donor Identification:</span>
                          <span className="font-semibold text-slate-700">#{unit.donorId}</span>
                        </div>

                        {/* Unit Card Dates (Strict Non-Overlapping Layout) */}
                        <div className="pt-2 border-t border-slate-200/70 text-[10px] text-slate-600 font-mono space-y-0.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Collected:</span>
                            <span className="text-slate-700">{unit.collectionDate}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Expires:</span>
                            <span className="font-bold text-slate-900">{unit.expiryDate}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {units.length === 0 && (
                    <div className="w-full py-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded flex flex-col items-center justify-center">
                      <Clock className="w-5 h-5 text-slate-300 mb-1" />
                      <span>Channel currently depleted. Zero units on hand for blood group {bg}.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Record Donation Modal with SVG Close Icon */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Record Blood Donation Entry
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDonateSubmit} className="p-5 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Verified Donor</label>
                <select
                  required
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                >
                  <option value="">-- Choose Registered Donor --</option>
                  {donors.map(d => (
                    <option key={d.id} value={d.id}>
                      #{d.id} - {d.name} ({d.bloodGroup}, {d.age} yrs)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Blood bag will be automatically routed to the designated channel corresponding to the donor's blood group.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Collection Date</label>
                <input
                  type="date"
                  required
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Red blood cell expiration protocol calculates 42 days shelf stability from collection.
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
                  Confirm &amp; Enqueue Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
