import React from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender 
} from '@tanstack/react-table';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from 'lucide-react';

const DataTable = ({ columns, data, loading = false }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto bg-primary-50 border-2 border-primary-200 rounded-3xl">
      <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-primary-200/50">
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id} 
                  className="px-8 py-6 text-[11px] font-black text-slate-700 uppercase tracking-[0.2em] border-b-2 border-primary-100"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-primary-100">
          <AnimatePresence>
            {loading ? (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <span className="text-slate-400 font-bold animate-pulse">Menghubungkan ke database...</span>
                  </div>
                </td>
              </motion.tr>
            ) : data.length === 0 ? (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td colSpan={columns.length} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3 grayscale opacity-30 text-slate-400">
                    <Database className="w-16 h-16" />
                    <span className="text-xl font-bold tracking-tight">Data Tidak Ditemukan</span>
                  </div>
                </td>
              </motion.tr>
            ) : (
              table.getRowModel().rows.map((row, idx) => (
                <motion.tr 
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group hover:bg-primary-50/30 transition-all duration-300"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-8 py-6 text-sm font-medium text-slate-600">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
