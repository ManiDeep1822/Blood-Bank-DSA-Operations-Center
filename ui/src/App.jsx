import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import OverviewView from './components/OverviewView';
import DonorBSTView from './components/DonorBSTView';
import StockFIFOView from './components/StockFIFOView';
import TriageHeapView from './components/TriageHeapView';
import DispenseAuditView from './components/DispenseAuditView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [stock, setStock] = useState({});
  const [requests, setRequests] = useState([]);
  const [dsaState, setDsaState] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals triggered from quick action shortcuts
  const [quickDonateOpen, setQuickDonateOpen] = useState(false);
  const [quickRequestOpen, setQuickRequestOpen] = useState(false);

  const fetchAllData = async () => {
    try {
      const [statsRes, donorsRes, stockRes, requestsRes, dsaRes, auditRes] = await Promise.all([
        fetch('/api/stats').then(r => r.json()).catch(() => null),
        fetch('/api/donors').then(r => r.json()).catch(() => ({ donors: [] })),
        fetch('/api/stock').then(r => r.json()).catch(() => ({ stock: {} })),
        fetch('/api/requests').then(r => r.json()).catch(() => ({ requests: [] })),
        fetch('/api/dsa-state').then(r => r.json()).catch(() => null),
        fetch('/api/audit').then(r => r.json()).catch(() => ({ auditLog: [] }))
      ]);

      if (statsRes) setStats(statsRes);
      if (donorsRes?.donors) setDonors(donorsRes.donors);
      if (stockRes?.stock) setStock(stockRes.stock);
      if (requestsRes?.requests) setRequests(requestsRes.requests);
      if (dsaRes) setDsaState(dsaRes);
      if (auditRes?.auditLog) setAuditLog(auditRes.auditLog);
    } catch (err) {
      console.error('Data sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 8000); // 8-second polling
    return () => clearInterval(interval);
  }, []);

  // API Mutators
  const handleRegisterDonor = async (donorData) => {
    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donorData)
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm(`Are you sure you want to remove Donor #${id} from the Binary Search Tree?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/donors/${id}`, { method: 'DELETE' });
      if (res.ok) await fetchAllData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDonateBlood = async (donationData) => {
    try {
      const res = await fetch('/api/stock/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationData)
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleSubmitRequest = async (requestData) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (res.ok) {
        await fetchAllData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleFulfillRequest = async () => {
    try {
      const res = await fetch('/api/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (err) {
      return { error: err.message };
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* 100% Width Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
      />

      {/* Main View Container - 100% Full Width */}
      <main className="w-full flex-1">
        {loading && !stats ? (
          <div className="w-full py-24 flex flex-col items-center justify-center text-slate-400">
            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <div className="text-xs font-mono">CONNECTING TO CLINICAL DATA ENGINE...</div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewView
                stats={stats}
                stock={stock}
                requests={requests}
                onNavigate={setActiveTab}
                onOpenDonate={() => setActiveTab('stock')}
                onOpenRequest={() => setActiveTab('triage')}
              />
            )}

            {activeTab === 'donors' && (
              <DonorBSTView
                donors={donors}
                bstRoot={dsaState?.bstRoot}
                onRegisterDonor={handleRegisterDonor}
                onDeleteDonor={handleDeleteDonor}
              />
            )}

            {activeTab === 'stock' && (
              <StockFIFOView
                stock={stock}
                donors={donors}
                onDonateBlood={handleDonateBlood}
              />
            )}

            {activeTab === 'triage' && (
              <TriageHeapView
                requests={requests}
                heapTree={dsaState?.heapTree}
                heapArray={dsaState?.heapArray}
                onSubmitRequest={handleSubmitRequest}
              />
            )}

            {activeTab === 'dispense' && (
              <DispenseAuditView
                requests={requests}
                stock={stock}
                auditLog={auditLog}
                onFulfillRequest={handleFulfillRequest}
                onRefresh={fetchAllData}
              />
            )}
          </>
        )}
      </main>

      {/* 100% Full Width Clinical Footer */}
      <footer className="w-full bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 tracking-tight">TRANSFUSION MEDICINE SYSTEM</span>
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="font-mono text-slate-600">STORAGE: data/donors.csv &amp; data/stock.csv</span>
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
          <span className="text-emerald-700 font-semibold font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
            <span>Core Data Synchronization Active</span>
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
          <span>BINARY SEARCH TREE: O(log N)</span>
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
          <span>FIFO QUEUE: O(1)</span>
          <span className="inline-block w-1 h-1 rounded-full bg-slate-300"></span>
          <span>MAX-HEAP: O(log M)</span>
        </div>
      </footer>
    </div>
  );
}
