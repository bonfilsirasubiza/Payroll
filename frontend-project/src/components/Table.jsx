import React, { useState, useMemo } from 'react';

export const Table = ({ headers = [], data = [], renderRow, pageSize = 10, renderCard, vertical = false }) => {
  const [page, setPage] = useState(1);

  // If data is small (<=2) default to vertical card layout unless overridden
  const shouldVertical = vertical || (Array.isArray(data) && data.length <= 2);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      {/* Desktop / Table view (hidden when vertical mode enabled) */}
      <div className={`${shouldVertical ? 'hidden' : 'hidden md:block'} overflow-x-auto`}>
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {headers.map((head, i) => (
                <th key={i} className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pageData.length > 0 ? (
                pageData.map((item, index) => {
                  const rendered = renderRow ? renderRow(item, (page - 1) * pageSize + index) : null;
                  const rowKey = (page - 1) * pageSize + index;
                  // If renderRow already returned a <tr>, keep it (but ensure it has a key)
                  if (React.isValidElement(rendered) && rendered.type === 'tr') {
                    return React.cloneElement(rendered, { key: rowKey });
                  }
                  // Otherwise wrap the returned <td> cells or fragment inside a <tr>
                  return <tr key={rowKey}>{rendered}</tr>;
                })
              ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-12 text-center text-gray-400 italic">
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Card view: label:value vertical layout. Visible on mobile by default, or always when `shouldVertical` is true */}
      <div className={`${shouldVertical ? 'p-4 space-y-3' : 'md:hidden p-4 space-y-3'}`}>
        {pageData.length > 0 ? (
          pageData.map((item, index) => (
            <div key={index} className="bg-white border rounded-xl p-4 shadow-sm">
              {renderCard ? (
                renderCard(item, (page - 1) * pageSize + index)
              ) : (
                <div className="space-y-2">
                  {headers.map((head, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div className="text-xs text-gray-400 w-1/2">{head}</div>
                      <div className="text-sm font-black text-right w-1/2">{getDisplayValue(item, head)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="px-4 py-12 text-center text-gray-400 italic">No records available.</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="text-sm text-gray-600">{
            data.length === 0 ? 'No records' : `Showing ${Math.min(data.length, (page - 1) * pageSize + 1)} - ${Math.min(data.length, page * pageSize)} of ${data.length}`
          }</div>
        <div className="flex items-center gap-2">
          <button onClick={() => goTo(page - 1)} disabled={page === 1} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40">Prev</button>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => goTo(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages} className="px-3 py-1 rounded bg-gray-100 disabled:opacity-40">Next</button>
        </div>
      </div>
    </div>
  );
};

// Heuristic to extract a display-friendly value from an item for a given header label
function getDisplayValue(item, header) {
  if (!item) return '';

  const h = header.toLowerCase();

  // common field matchers handled via heuristics below

  // If header contains keywords, try specific fields
  if (h.includes('employee')) {
    const cand = item.employee || item.employeeId || item.employeeName || item.name || item.fullName;
    if (cand) return typeof cand === 'object' ? (cand.name || cand.fullName || cand._id) : cand;
  }
  if (h.includes('amount') || h.includes('salary') || h.includes('paid')) {
    return item.netSalary ?? item.totalSalary ?? item.amount ?? item.basicSalary ?? '';
  }
  if (h.includes('date') || h.includes('created')) {
    const d = item.createdAt ?? item.paymentDate ?? item.date;
    return d ? new Date(d).toLocaleDateString() : '';
  }
  if (h.includes('month')) {
    return item.payMonth ?? item.month ?? '';
  }

  // try direct header-to-key heuristics
  const keyCandidates = [
    header.replace(/[^a-zA-Z0-9]/g, ''),
    header.toLowerCase().replace(/[^a-z0-9]/g, ''),
    header.split(' ').map((s,i)=> i===0?s.toLowerCase(): s.charAt(0).toUpperCase()+s.slice(1).toLowerCase()).join('')
  ];

  for (const k of keyCandidates) {
    if (!k) continue;
    if (Object.prototype.hasOwnProperty.call(item, k)) {
      const v = item[k];
      if (v && typeof v === 'object') return v.name ?? v.fullName ?? JSON.stringify(v);
      return String(v);
    }
  }

  // fallback: try to find first primitive property on the item
  for (const [k, v] of Object.entries(item)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (typeof v === 'object') {
      if (v.name || v.fullName) return v.name ?? v.fullName;
    }
  }

  return '';
}