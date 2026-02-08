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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";

type CsvRow = Record<string, string>;

interface Props {
  data: CsvRow[];
  onSubmitMediaPlan: (payload: CsvRow) => Promise<void>;
}

const MEDIA_PLAN_READ_ONLY_COLUMNS = new Set([
  "CLIENT",
  "PRODUCT",
  "CAMPAIGN_ID",
  "CAMPAIGN_NAME",
  "PACKAGE",
  "PLACMENT",
  "FLIGHT",
  "TOTAL_BUDGET",
  "IMPRESSIONS",
]);

export default function MediaplanTable({ data, onSubmitMediaPlan }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<CsvRow>({});

  // -----------------------------
  // CAMPAIGN FILTER
  // -----------------------------
  const campaignIds = useMemo(() => {
    const ids = new Set<string>();
    data.forEach((row) => row.CAMPAIGN_ID && ids.add(row.CAMPAIGN_ID));
    return Array.from(ids);
  }, [data]);

  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCampaignIds(campaignIds);
  }, [campaignIds]);

  const filteredData = useMemo(() => {
    if (selectedCampaignIds.length === 0) return [];
    return data.filter((row) => selectedCampaignIds.includes(row.CAMPAIGN_ID));
  }, [data, selectedCampaignIds]);

  const isAllCampaignSelected =
    campaignIds.length > 0 && selectedCampaignIds.length === campaignIds.length;

  // -----------------------------
  // COLUMNS
  // -----------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (filteredData.length === 0) return [];

    return Object.keys(filteredData[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue, row }) => {
        const value = getValue<string>();

        if (key === "PLACMENT") {
          return (
            <div
              className="cursor-pointer text-slate-900 whitespace-normal break-words"
              onClick={() => {
                setFormData(row.original); // ✅ FIX
                setOpenDialog(true);
              }}
            >
              {value || "—"}
            </div>
          );
        }

        return (
          <div className="whitespace-normal break-words">{value || "—"}</div>
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
      {/* FILTER */}
      <div className="p-4 border-b flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-2 border-slate-700 gap-2"
            >
              Campaign ID <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={isAllCampaignSelected}
              onCheckedChange={(checked) =>
                setSelectedCampaignIds(checked ? campaignIds : [])
              }
              onSelect={(e) => e.preventDefault()}
              className="font-semibold"
            >
              Select All
            </DropdownMenuCheckboxItem>

            <div className="my-1 h-px bg-slate-200" />

            {campaignIds.map((id) => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={selectedCampaignIds.includes(id)}
                onCheckedChange={(checked) =>
                  setSelectedCampaignIds((prev) =>
                    checked ? [...prev, id] : prev.filter((c) => c !== id)
                  )
                }
                onSelect={(e) => e.preventDefault()}
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
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-white uppercase text-sm font-bold"
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
                  <TableCell key={cell.id} className="border-r">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG */}
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDialog(false);
            setFormData({});
          }
        }}
      >
        <DialogContent
          className="max-w-4xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>View Media Plan</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] px-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => {
                const readOnly = MEDIA_PLAN_READ_ONLY_COLUMNS.has(key);

                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs text-muted-foreground">
                      {key}
                    </label>
                    <Input
                      value={value ?? ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      onChange={(e) => {
                        if (!readOnly) {
                          setFormData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }));
                        }
                      }}
                      className={
                        readOnly
                          ? "bg-muted cursor-not-allowed text-muted-foreground"
                          : ""
                      }
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button
              onClick={async () => {
                await onSubmitMediaPlan(formData);
                setOpenDialog(false);
                setFormData({});
              }}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
