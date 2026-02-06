import { useEffect, useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";

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
  // RADIA_ID FILTER STATE
  // -----------------------------
  const radiaIds = useMemo(() => {
    const ids = new Set<string>();
    data.forEach((row) => {
      if (row.RADIA_ID) {
        ids.add(row.RADIA_ID);
      }
    });
    return Array.from(ids);
  }, [data]);

  const [selectedRadiaIds, setSelectedRadiaIds] = useState<string[]>([]);

useEffect(() => {
  setSelectedRadiaIds(radiaIds); // select all by default
}, [radiaIds]);

    const filteredData = useMemo(() => {
      if (selectedRadiaIds.length === 0) return [];
      return data.filter((row) =>
        selectedRadiaIds.includes(row.RADIA_ID)
      );
    }, [data, selectedRadiaIds]);

    const isAllSelected =
  radiaIds.length > 0 &&
  selectedRadiaIds.length === radiaIds.length;

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (filteredData.length === 0) return [];

    return Object.keys(filteredData[0]).map((key) => ({
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
  }, [filteredData]);

  // -----------------------------
  // TABLE INSTANCE
  // -----------------------------
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility },
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
      {/* HEADER + FILTER */}
      <div className="p-4 border-b flex items-center gap-4">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="flex items-center border-2 border-slate-700 gap-2 text-base px-4 py-2"
      >
        Radia ID
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="start"
      className="w-72 max-h-64 overflow-y-auto"
    >
      {/* ✅ SELECT ALL */}
      <DropdownMenuCheckboxItem
        checked={isAllSelected}
        onCheckedChange={(checked) => {
          setSelectedRadiaIds(checked ? radiaIds : []);
        }}
        onSelect={(e) => e.preventDefault()}
        className="font-semibold"
      >
        Select All
      </DropdownMenuCheckboxItem>

      <div className="my-1 h-px bg-slate-200" />

      {/* INDIVIDUAL RADIA IDs */}
      {radiaIds.map((id) => (
        <DropdownMenuCheckboxItem
          key={id}
          checked={selectedRadiaIds.includes(id)}
          onCheckedChange={(checked) => {
            setSelectedRadiaIds((prev) =>
              checked
                ? [...prev, id]
                : prev.filter((v) => v !== id)
            );
          }}
          onSelect={(e) => e.preventDefault()} // ⭐ keep open
        >
          {id}
        </DropdownMenuCheckboxItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
</div>

      {/* TABLE */}
      <div className="overflow-auto">
        <Table>
        <TableHeader className="bg-slate-800">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-slate-800">
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="
            border-r border-slate-700
            px-4 py-3
            text-sm
            font-bold
            uppercase
            tracking-wide
            text-white
            last:border-r-0
          "
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
                    className="border-r border-slate-200"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground py-6"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
