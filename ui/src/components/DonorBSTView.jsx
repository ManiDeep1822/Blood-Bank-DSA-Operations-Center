import React, { useState } from 'react';
import { Search, Plus, Trash2, GitBranch, ListFilter, AlertCircle, CheckCircle, X, UserPlus } from 'lucide-react';
import TreeVisualizer from './TreeVisualizer';

export default function DonorBSTView({ donors, bstRoot, onRegisterDonor, onDeleteDonor }) {
  const [searchId, setSearchId] = useState('');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'tree'
  const [showModal, setShowModal] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searched, setSearched] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('A+');
  const [contact, setContact] = useState('');
  const [formError, setFormError] = useState('');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId) {
      setSearchResult(null);
      setSearched(false);
      return;
    }
    const idNum = parseInt(searchId, 10);
    const found = donors.find(d => d.id === idNum);
    setSearchResult(found || null);
    setSearched(true);
  };

  const clearSearch = () => {
    setSearchId('');
    setSearchResult(null);
    setSearched(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      setFormError('Clinical Protocol: Donor must be between 18 and 65 years old.');
      return;
    }

    if (!name.trim() || !contact.trim()) {
      setFormError('Please complete all required fields.');
      return;
    }

    const success = await onRegisterDonor({
      name: name.trim(),
      age: ageNum,
      gender,
      bloodGroup,
      contact: contact.trim()
    });

    if (success) {
      setShowModal(false);
      setName('');
      setAge('');
      setContact('');
      setFormError('');
    } else {
      setFormError('Failed to register donor record.');
    }
  };

  const filteredDonors = donors.filter(d => {
    if (filterGroup !== 'ALL' && d.bloodGroup !== filterGroup) return false;
    return true;
  });

  return (
    <div className="w-full px-6 py-6 space-y-6">
      {/* Header and Control Bar - 100% Width */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            DONOR REGISTRY DIRECTORY
          </h2>
          <p className="text-xs text-slate-500">
            Donor medical records are indexed using an in-memory binary search tree keyed by unique identification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex items-center gap-1.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="number"
                placeholder="Find Donor ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 w-44 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded hover:bg-slate-700 transition cursor-pointer"
            >
              Search
            </button>
            {searched && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Reset
              </button>
            )}
          </form>

          {/* Blood Group Filter */}
          <div className="flex items-center gap-1.5">
            <ListFilter className="w-4 h-4 text-slate-400" />
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="text-xs border border-slate-200 rounded bg-slate-50 px-2.5 py-1.5 focus:outline-none font-semibold text-slate-700"
            >
              <option value="ALL">All Groups</option>
              {bloodGroups.map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Directory Table
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'tree' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Tree Structure</span>
            </button>
          </div>

          {/* Register Action */}
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-semibold rounded hover:bg-red-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Donor</span>
          </button>
        </div>
      </div>

      {/* Search Result Banner if active */}
      {searched && (
        <div className={`p-4 rounded-lg border text-xs flex items-center justify-between ${
          searchResult ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          {searchResult ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold">Donor Verified in Registry: </span>
                <span>#{searchResult.id} &mdash; {searchResult.name} ({searchResult.gender}, {searchResult.age} yrs) &mdash; Blood Group: </span>
                <span className="font-bold text-red-600 font-mono">{searchResult.bloodGroup}</span>
                <span> &mdash; Contact: {searchResult.contact} &mdash; Last Donated: {searchResult.lastDonationDate}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>No donor record located for ID #{searchId}.</span>
            </div>
          )}
          <button onClick={clearSearch} className="font-semibold underline cursor-pointer text-slate-700 hover:text-slate-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Content View: Table or Tree Visualizer */}
      {viewMode === 'tree' ? (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Binary Search Tree Visual Topology
            </h3>
            <p className="text-xs text-slate-500">
              Left descendants have smaller numerical identifiers; right descendants have larger identifiers.
            </p>
          </div>
          <TreeVisualizer root={bstRoot} type="bst" />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chronological Registry Directory ({filteredDonors.length} Verified Donors)
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              In-Order Traversal &bull; Ascending Identification Sequence
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5 font-bold">Donor ID</th>
                  <th className="py-3 px-5 font-bold">Full Legal Name</th>
                  <th className="py-3 px-5 font-bold">Age</th>
                  <th className="py-3 px-5 font-bold">Gender</th>
                  <th className="py-3 px-5 font-bold">Blood Group</th>
                  <th className="py-3 px-5 font-bold">Contact Number</th>
                  <th className="py-3 px-5 font-bold">Last Donation</th>
                  <th className="py-3 px-5 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredDonors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-5 font-mono font-bold text-slate-900">#{donor.id}</td>
                    <td className="py-3 px-5 font-semibold text-slate-800">{donor.name}</td>
                    <td className="py-3 px-5 text-slate-600 font-mono">{donor.age}</td>
                    <td className="py-3 px-5 text-slate-600">{donor.gender}</td>
                    <td className="py-3 px-5">
                      <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-red-100 text-red-800 border border-red-200">
                        {donor.bloodGroup}
                      </span>
                    </td>
                    <td className="py-3 px-5 font-mono text-slate-600">{donor.contact}</td>
                    <td className="py-3 px-5 text-slate-500 font-mono text-[11px]">{donor.lastDonationDate}</td>
                    <td className="py-3 px-5 text-right">
                      <button
                        onClick={() => onDeleteDonor(donor.id)}
                        className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Remove Donor Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDonors.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-10 text-center text-slate-400 text-xs">
                      No matching donor records located.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Donor Modal with SVG Close Icon */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-slate-300 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Register New Volunteer Donor
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Donor Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age (18-65)</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="65"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="28"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
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
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+1-555-0199"
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  />
                </div>
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
                  Verify &amp; Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
