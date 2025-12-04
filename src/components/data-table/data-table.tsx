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
  initialVisibility?: VisibilityState;
  isLoading?: boolean;
  onRowClick?: (row: TData) => void;
  toolbarSlot?: React.ReactNode;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterKey,
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
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
            <Input
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Search..."
              className="pl-9 sm:pl-10 h-11 sm:h-10 bg-surface/60 border-surface/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex w-full items-center justify-end gap-2 md:w-auto">{toolbarSlot}</div>
      </div>
      
      <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-surface/30 bg-card/95 backdrop-blur-sm shadow-2xl shadow-black/20">
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
        <div className="flex items-center gap-2 w-full md:w-auto justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="bg-surface/60 border-surface/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">← Previous</span>
            <span className="sm:hidden">←</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="bg-surface/60 border-surface/40 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
          >
            <span className="hidden sm:inline">Next →</span>
            <span className="sm:hidden">→</span>
          </Button>
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
