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

export default function MediaplanTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // -----------------------------
  // CAMPAIGN FILTER STATE
  // -----------------------------
  const campaignIds = useMemo(() => {
    const ids = new Set<string>();
    data.forEach((row) => {
      if (row.CAMPAIGN_ID) {
        ids.add(row.CAMPAIGN_ID);
      }
    });
    return Array.from(ids);
  }, [data]);

  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

useEffect(() => {
  setSelectedCampaignIds(campaignIds); // select all by default
}, [campaignIds]);

  const filteredData = useMemo(() => {
    if (selectedCampaignIds.length === 0) return [];
    return data.filter((row) => selectedCampaignIds.includes(row.CAMPAIGN_ID));
  }, [data, selectedCampaignIds]);

  const isAllCampaignSelected =
  campaignIds.length > 0 &&
  selectedCampaignIds.length === campaignIds.length;

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
          <div className="break-words whitespace-normal">{value || "—"}</div>
        );
      },
    }));
  }, [filteredData]);

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
        Campaign ID
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="start"
      className="w-72 max-h-64 overflow-y-auto"
    >
      {/* ✅ SELECT ALL */}
      <DropdownMenuCheckboxItem
        checked={isAllCampaignSelected}
        onCheckedChange={(checked) => {
          setSelectedCampaignIds(checked ? campaignIds : []);
        }}
        onSelect={(e) => e.preventDefault()} // keep open
        className="font-semibold"
      >
        Select All
      </DropdownMenuCheckboxItem>

      <div className="my-1 h-px bg-slate-200" />

      {/* INDIVIDUAL CAMPAIGN IDS */}
      {campaignIds.map((id) => (
        <DropdownMenuCheckboxItem
          key={id}
          checked={selectedCampaignIds.includes(id)}
          onCheckedChange={(checked) => {
            setSelectedCampaignIds((prev) =>
              checked
                ? [...prev, id]
                : prev.filter((c) => c !== id)
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
