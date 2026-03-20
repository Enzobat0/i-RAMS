import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import SidebarDetail from '../components/SideBarDetail';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const PriorityBadge = ({ level }) => {
  const map = {
    1: { label: 'High',     classes: 'bg-red-50 text-red-600 border border-red-100' },
    2: { label: 'Medium',   classes: 'bg-amber-50 text-amber-600 border border-amber-100' },
    3: { label: 'Low',      classes: 'bg-green-50 text-green-700 border border-green-100' },
    0: { label: 'Unranked', classes: 'bg-slate-100 text-slate-400 border border-slate-200' },
  };
  const { label, classes } = map[level] ?? map[0];
  return (
    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-lg ${classes}`}>
      {label}
    </span>
  );
};

const SortIcon = ({ field, current }) => {
  if (current.field !== field) return <ArrowUpDown size={13} className="text-slate-300 ml-1 inline" />;
  return current.dir === 'asc'
    ? <ArrowUp   size={13} className="text-[#1B5E20] ml-1 inline" />
    : <ArrowDown size={13} className="text-[#1B5E20] ml-1 inline" />;
};

const COLUMNS = [
  { key: 'segment_id',            label: 'Segment ID',  sortable: true  },
  { key: 'road_class',            label: 'Class',       sortable: true  },
  { key: 'road_type',             label: 'Type',        sortable: true  },
  { key: 'pop_within_2km',        label: 'Population',  sortable: true  },
  { key: 'health_facility_count', label: 'Health',      sortable: true  },
  { key: 'school_count',          label: 'Schools',     sortable: true  },
  { key: 'is_only_access',        label: 'Sole Access', sortable: false },
  { key: 'latest_ddi_score',      label: 'DDI',         sortable: true  },
  { key: 'current_mca_score',     label: 'MCA Score',   sortable: true  },
  { key: 'priority_level',        label: 'Priority',    sortable: true  },
];

const InventoryPage = () => {
  const [rows, setRows]         = useState([]);
  const [totalCount, setTotal]  = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

  // Real counts fetched once on mount — not derived from current page
  const [priorityCounts, setPriorityCounts] = useState({ high: 0, medium: 0, low: 0 });

  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [priorityFilter, setPriority] = useState('');
  const [sort, setSort]               = useState({ field: 'current_mca_score', dir: 'desc' });
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 50;

  const [selectedSegment, setSelectedSegment] = useState(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Fetch real priority counts once on mount using page_size=1 (only need the `count` field)
  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/roads/`, { params: { priority_level: 1, page_size: 1 } }),
      axios.get(`${API_URL}/api/roads/`, { params: { priority_level: 2, page_size: 1 } }),
      axios.get(`${API_URL}/api/roads/`, { params: { priority_level: 3, page_size: 1 } }),
    ]).then(([high, med, low]) => {
      setPriorityCounts({
        high:   high.data.count,
        medium: med.data.count,
        low:    low.data.count,
      });
    }).catch(() => {});
  }, []);

  const debounceRef = useRef(null);
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
  };
  const clearSearch = () => { setSearchInput(''); setSearch(''); setPage(1); };

  const handleSort = useCallback((field) => {
    setSort(prev => ({ field, dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  }, []);

  const handlePriorityFilter = (val) => { setPriority(val); setPage(1); };

  useEffect(() => {
    setLoading(true);
    setError(false);
    const ordering = sort.dir === 'asc' ? sort.field : `-${sort.field}`;
    const params = {
      page, page_size: PAGE_SIZE, ordering,
      ...(search         && { search }),
      ...(priorityFilter && { priority_level: priorityFilter }),
    };
    axios.get(`${API_URL}/api/roads/`, { params })
      .then(res => { setRows(res.data.results); setTotal(res.data.count); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [search, priorityFilter, sort, page]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-sans pb-10">

      <header className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Road Asset Inventory</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Bugesera District — {totalCount.toLocaleString()} road segments
          </p>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Bugesera District, Rwanda
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 flex flex-col px-10 py-6 gap-5 min-w-0">

          {/* Summary stat strip — counts from API, not from current page */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Segments',  value: totalCount.toLocaleString(),            color: 'text-[#1B5E20]' },
              { label: 'High Priority',   value: priorityCounts.high.toLocaleString(),   color: 'text-red-500'   },
              { label: 'Medium Priority', value: priorityCounts.medium.toLocaleString(), color: 'text-amber-500' },
              { label: 'Low Priority',    value: priorityCounts.low.toLocaleString(),    color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden flex-1">

            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search segment ID, class, type…"
                  value={searchInput}
                  onChange={e => handleSearchInput(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-green-700 focus:ring-1 focus:ring-green-700 transition-all"
                />
                {searchInput && (
                  <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {[
                  { val: '',  label: 'All' },
                  { val: '1', label: 'High',   active: 'bg-red-500 text-white border-red-500' },
                  { val: '2', label: 'Medium', active: 'bg-amber-400 text-white border-amber-400' },
                  { val: '3', label: 'Low',    active: 'bg-green-500 text-white border-green-500' },
                ].map(f => (
                  <button
                    key={f.val}
                    onClick={() => handlePriorityFilter(f.val)}
                    className={`
                      text-xs font-bold px-3 py-1.5 rounded-lg border transition-all
                      ${priorityFilter === f.val
                        ? (f.active || 'bg-[#1B5E20] text-white border-[#1B5E20]')
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <p className="ml-auto text-xs text-slate-400 font-medium whitespace-nowrap">
                {loading ? 'Loading…' : `${totalCount.toLocaleString()} results`}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    {COLUMNS.map(col => (
                      <th
                        key={col.key}
                        onClick={col.sortable ? () => handleSort(col.key) : undefined}
                        className={`
                          px-5 py-3 text-[0.7rem] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap
                          ${col.sortable ? 'cursor-pointer hover:text-slate-800 select-none' : ''}
                          ${sort.field === col.key ? 'text-[#1B5E20]' : ''}
                        `}
                      >
                        {col.label}
                        {col.sortable && <SortIcon field={col.key} current={sort} />}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading && Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {COLUMNS.map(col => (
                        <td key={col.key} className="px-5 py-3.5">
                          <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))}
                  {!loading && error && (
                    <tr><td colSpan={COLUMNS.length} className="px-5 py-16 text-center text-slate-400 text-sm">Could not load road data.</td></tr>
                  )}
                  {!loading && !error && rows.length === 0 && (
                    <tr><td colSpan={COLUMNS.length} className="px-5 py-16 text-center text-slate-400 text-sm">No segments match your search or filter.</td></tr>
                  )}
                  {!loading && !error && rows.map(row => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedSegment(row)}
                      className={`hover:bg-green-50/40 cursor-pointer transition-colors ${selectedSegment?.id === row.id ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{row.segment_id}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold text-[#1B5E20] bg-green-50 px-2 py-0.5 rounded">{row.road_class || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{row.road_type || '—'}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-700 tabular-nums">{row.pop_within_2km.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 tabular-nums text-center">
                        {row.health_facility_count > 0 ? <span className="font-bold text-slate-700">{row.health_facility_count}</span> : <span className="text-slate-300">0</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 tabular-nums text-center">
                        {row.school_count > 0 ? <span className="font-bold text-slate-700">{row.school_count}</span> : <span className="text-slate-300">0</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {row.is_only_access ? <span className="text-xs font-bold text-[#1B5E20]">Yes</span> : <span className="text-xs text-slate-300">No</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 tabular-nums font-medium">{row.latest_ddi_score.toFixed(2)}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-black text-[#1B5E20] tabular-nums">{row.current_mca_score.toFixed(2)}</span>
                      </td>
                      <td className="px-5 py-3.5"><PriorityBadge level={row.priority_level} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-white">
              <p className="text-xs text-slate-400 font-medium">
                Page <span className="font-bold text-slate-600">{page}</span> of{' '}
                <span className="font-bold text-slate-600">{totalPages.toLocaleString()}</span>
                {' '}·{' '}
                <span className="font-bold text-slate-600">{totalCount.toLocaleString()}</span> total segments
              </p>
              <div className="flex items-center gap-1">
                <PaginationBtn onClick={() => setPage(1)} disabled={page === 1}><ChevronsLeft size={14} /></PaginationBtn>
                <PaginationBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></PaginationBtn>
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === '…' ? (
                    <span key={`e-${i}`} className="px-2 text-slate-300 text-xs select-none">…</span>
                  ) : (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? 'bg-[#1B5E20] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                    >{p}</button>
                  )
                )}
                <PaginationBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></PaginationBtn>
                <PaginationBtn onClick={() => setPage(totalPages)} disabled={page === totalPages}><ChevronsRight size={14} /></PaginationBtn>
              </div>
            </div>
          </div>
        </div>

        {selectedSegment && (
          <div className="w-[360px] shrink-0 px-0 py-6 pr-6">
            <SidebarDetail segment={selectedSegment} onClose={() => setSelectedSegment(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

const PaginationBtn = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${disabled ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
  >{children}</button>
);

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

export default InventoryPage;