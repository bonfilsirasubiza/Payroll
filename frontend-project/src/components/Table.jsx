import React, { useEffect, useState, useMemo } from 'react';

const tableVariants = {
  default: {
    wrapper: 'bg-gray-900',
    head: 'bg-gray-800 border-gray-700',
    headText: 'text-gray-300',
    divider: 'divide-gray-700',
    empty: 'text-gray-300',
    footer: 'border-gray-700',
    meta: 'text-gray-300',
    pageButton: 'bg-gray-700 text-white hover:bg-gray-600',
    pageButtonActive: 'bg-blue-800 text-white hover:bg-blue-700'
  },
  blue: {
    wrapper: 'bg-gradient-to-b from-slate-950 to-blue-950',
    head: 'bg-blue-900/70 border-blue-800',
    headText: 'text-blue-100',
    divider: 'divide-blue-900/60',
    empty: 'text-blue-100/75',
    footer: 'border-blue-900/70',
    meta: 'text-blue-100/80',
    pageButton: 'bg-blue-900 text-blue-100 hover:bg-blue-800',
    pageButtonActive: 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
  }
};

export const Table = ({ headers = [], data = [], renderRow, mobileRender, pageSize = 10, variant = 'default' }) => {
  const [page, setPage] = useState(1);
  const theme = tableVariants[variant] || tableVariants.default;
  const hasMobileRender = typeof mobileRender === 'function';

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className={`w-full overflow-hidden rounded-3xl shadow-sm ${theme.wrapper}`}>
      {hasMobileRender && (
        <div className="grid gap-3 p-3 md:hidden">
          {pageData.length > 0 ? (
            pageData.map((item, index) => {
              const rowKey = (page - 1) * pageSize + index;
              return (
                <div key={rowKey}>
                  {mobileRender(item, rowKey)}
                </div>
              );
            })
          ) : (
            <div className={`rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm italic ${theme.empty}`}>
              No records available.
            </div>
          )}
        </div>
      )}

      <div className={hasMobileRender ? 'hidden overflow-x-auto md:block' : 'overflow-x-auto'}>
        <table className="min-w-full text-left">
          <thead className={`border-b ${theme.head}`}>
            <tr>
              {headers.map((head, i) => (
                <th key={i} className={`px-6 py-4 text-xs font-black uppercase tracking-widest whitespace-nowrap ${theme.headText}`}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y ${theme.divider}`}>
            {pageData.length > 0 ? (
              pageData.map((item, index) => {
                const rendered = renderRow ? renderRow(item, (page - 1) * pageSize + index) : null;
                const rowKey = (page - 1) * pageSize + index;

                if (React.isValidElement(rendered) && rendered.type === 'tr') {
                  return React.cloneElement(rendered, { key: rowKey });
                }

                return <tr key={rowKey}>{rendered}</tr>;
              })
            ) : (
              <tr>
                <td colSpan={headers.length} className={`px-6 py-12 text-center italic ${theme.empty}`}>
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={`flex flex-col gap-3 px-4 py-3 border-t sm:flex-row sm:items-center sm:justify-between ${theme.footer}`}>
          <div className={`text-sm ${theme.meta}`}>{
            data.length === 0 ? 'No records' : `Showing ${Math.min(data.length, (page - 1) * pageSize + 1)} - ${Math.min(data.length, page * pageSize)} of ${data.length}`
          }</div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <button onClick={() => goTo(page - 1)} disabled={page === 1} className={`px-3 py-1 rounded transition-colors disabled:opacity-40 ${theme.pageButton}`}>Prev</button>
          <div className="hidden sm:flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => goTo(i + 1)} className={`px-3 py-1 rounded transition-colors ${page === i + 1 ? theme.pageButtonActive : theme.pageButton}`}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages} className={`px-3 py-1 rounded transition-colors disabled:opacity-40 ${theme.pageButton}`}>Next</button>
        </div>
      </div>
    </div>
  );
};
