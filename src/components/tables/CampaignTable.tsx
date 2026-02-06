import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type CsvRow = Record<string, string>;

interface Props {
  data: CsvRow[];
}

export default function CampaignTable({ data }: Props) {
  // -----------------------------
  // TABLE STATE
  // -----------------------------
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => {
        const value = getValue<string>();
        return (
          <div className="break-words whitespace-normal">
            {value || "—"}
          </div>
        );
      },
    }));
  }, [data]);

  // -----------------------------
  // TABLE INSTANCE
  // -----------------------------
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <Card>
      {/* HEADER */}
      <div className="p-4 border-b font-semibold">
        CAMPAIGN OVERVIEW TABLE
      </div>

      {/* TABLE */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-r border-slate-200 "
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-r border-slate-200 "
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
