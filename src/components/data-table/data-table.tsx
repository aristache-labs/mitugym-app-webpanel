"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterKey?: string;
  filterPlaceholder?: string;
  initialVisibility?: VisibilityState;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  toolbarSlot?: React.ReactNode;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
  filterPlaceholder = "Search...",
  initialVisibility,
  isLoading,
  onRowClick,
  toolbarSlot,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialVisibility ?? {});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  React.useEffect(() => {
    if (!filterKey) {
      return;
    }
    const column = table.getColumn(filterKey);
    if (column && column.getCanFilter()) {
      column.setFilterValue(globalFilter);
    }
  }, [globalFilter, filterKey, table]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        {filterKey ? (
          <div className="relative w-full max-w-sm group">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-px h-4 bg-surface/40 group-focus-within:bg-primary/30 transition-colors duration-200"></div>
                  <Search className="h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors duration-200" strokeWidth={2} />
                </div>
              </div>
              <Input
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                placeholder={filterPlaceholder}
                className="h-10 pl-12 pr-10 bg-gradient-to-r from-surface/40 to-surface/30 border border-surface/50 rounded-xl focus:border-primary/40 focus:ring-2 focus:ring-primary/10 focus:bg-surface/60 hover:border-surface/60 transition-all duration-200 placeholder:text-muted/50 text-sm shadow-sm"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted/60 hover:text-primary hover:bg-primary/10 transition-all duration-200 group/clear"
                  aria-label="Clear search"
                >
                  <svg className="h-3.5 w-3.5 group-hover/clear:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div />
        )}
        <div className="flex w-full items-center justify-end gap-2 md:w-auto">{toolbarSlot}</div>
      </div>
      
      <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-surface/30 bg-card/95 backdrop-blur-sm shadow-md">
        <Table className="min-w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-surface/20 bg-gradient-to-r from-primary/5 to-secondary/5 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 transition-all duration-200">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-[10px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.1em] text-muted/80 font-semibold py-3 sm:py-4 px-3 sm:px-6 text-center whitespace-nowrap">
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() && "cursor-pointer select-none hover:text-primary transition-colors",
                            "flex items-center justify-center gap-1 sm:gap-2"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-primary/70">
                            {{
                              asc: "↑",
                              desc: "↓",
                            }[header.column.getIsSorted() as string] ?? null}
                          </span>
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 sm:h-32 text-center">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <span className="text-xs sm:text-sm text-muted/80">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-b border-surface/10 hover:bg-gradient-to-r hover:from-surface/80 hover:to-surface/60 transition-all duration-200",
                    onRowClick && "cursor-pointer hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
                    index % 2 === 0 ? "bg-surface/20" : "bg-surface/10"
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3 sm:py-4 px-3 sm:px-6 text-text text-xs sm:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 sm:h-32 text-center">
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary/60" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm font-medium text-text">No results found</p>
                      <p className="text-xs text-muted/80">Try adjusting your search criteria</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 md:flex-row">
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="group relative flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-br from-card/98 via-surface/95 to-surface/85 border border-primary/35 text-primary font-semibold text-xs tracking-wide transition-all duration-500 hover:from-primary/18 hover:via-primary/12 hover:to-primary/8 hover:border-primary/60 hover:shadow-[0_8px_32px_rgba(77,212,212,0.25)] hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[1.01] disabled:opacity-20 disabled:cursor-not-allowed disabled:border-surface/20 disabled:text-muted/25 disabled:hover:from-card/98 disabled:hover:via-surface/95 disabled:hover:to-surface/85 disabled:hover:border-primary/35 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 overflow-hidden backdrop-blur-xl shadow-lg shadow-black/20"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent opacity-70"></div>
            
            {/* Metallic shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out"></div>
            
            {/* Secondary shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-out delay-100"></div>
            
            {/* Inner border glow */}
            <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{boxShadow: 'inset 0 0 30px rgba(77, 212, 212, 0.15)'}}></div>
            
            <svg 
              className="w-3.5 h-3.5 transition-all duration-500 group-hover:-translate-x-1 group-hover:scale-[1.15] group-hover:drop-shadow-[0_0_10px_rgba(77,212,212,0.8)] group-hover:brightness-125 relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline relative z-10 group-hover:tracking-[0.15em] transition-all duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Previous</span>
          </button>
          
          <button
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="group relative flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-gradient-to-br from-card/98 via-surface/95 to-surface/85 border border-primary/35 text-primary font-semibold text-xs tracking-wide transition-all duration-500 hover:from-primary/18 hover:via-primary/12 hover:to-primary/8 hover:border-primary/60 hover:shadow-[0_8px_32px_rgba(77,212,212,0.25)] hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[1.01] disabled:opacity-20 disabled:cursor-not-allowed disabled:border-surface/20 disabled:text-muted/25 disabled:hover:from-card/98 disabled:hover:via-surface/95 disabled:hover:to-surface/85 disabled:hover:border-primary/35 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:hover:scale-100 overflow-hidden backdrop-blur-xl shadow-lg shadow-black/20"
          >
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-bl from-primary/8 via-transparent to-transparent opacity-70"></div>
            
            {/* Metallic shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out"></div>
            
            {/* Secondary shine */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-full group-hover:-translate-x-full transition-transform duration-1000 ease-out delay-100"></div>
            
            {/* Inner border glow */}
            <div className="absolute inset-[2px] rounded-[14px] bg-gradient-to-bl from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" style={{boxShadow: 'inset 0 0 30px rgba(77, 212, 212, 0.15)'}}></div>
            
            <span className="hidden sm:inline relative z-10 group-hover:tracking-[0.15em] transition-all duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">Next</span>
            <svg 
              className="w-3.5 h-3.5 transition-all duration-500 group-hover:translate-x-1 group-hover:scale-[1.15] group-hover:drop-shadow-[0_0_10px_rgba(77,212,212,0.8)] group-hover:brightness-125 relative z-10" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="text-muted/80 text-center">
            Showing {table.getRowModel().rows.length} of {data.length} results
          </span>
          <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] sm:text-xs font-medium border border-primary/20">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
        </div>
      </div>
    </div>
  );
}
