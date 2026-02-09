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
              className="cursor-pointer text-slate-900 whitespace-normal break-words text-xs md:text-sm min-h-[40px] flex items-center"
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
          <div className="whitespace-normal break-words text-xs md:text-sm min-h-[40px] flex items-center">{value || "—"}</div>
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
    <Card className="overflow-hidden">
      {/* FILTER - Mobile Responsive */}
      <div className="p-2 md:p-4 border-b flex items-center gap-2 md:gap-4 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-2 border-slate-700 gap-1 md:gap-2 text-xs md:text-base px-3 md:px-4 py-1.5 md:py-2 w-full sm:w-auto"
            >
              Campaign ID <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 md:w-72 max-h-56 md:max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={isAllCampaignSelected}
              onCheckedChange={(checked) =>
                setSelectedCampaignIds(checked ? campaignIds : [])
              }
              onSelect={(e) => e.preventDefault()}
              className="font-semibold text-xs md:text-sm"
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
                className="text-xs md:text-sm"
              >
                {id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE - Mobile Responsive with Text Wrapping */}
      <div className="overflow-auto -mx-1 md:mx-0">
        <Table className="w-full">
        <TableHeader className="bg-slate-800">
      {table.getHeaderGroups().map((hg) => (
        <TableRow key={hg.id} className="hover:bg-slate-800">
          {hg.headers.map((header, index) => (
            <TableHead
              key={header.id}
              className={`
                border-r border-slate-700
                px-2 md:px-4
                py-2 md:py-3
                text-xs md:text-sm
                font-bold
                uppercase
                tracking-wide
                text-white
                whitespace-normal
                break-words
                min-w-[100px] md:min-w-[120px]
                text-center
                ${index === hg.headers.length - 1 ? 'border-r-0' : ''}
              `}
            >
              <div className="min-h-[40px] flex items-center justify-center">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </div>
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <TableRow 
                key={row.id} 
                className={`
                  hover:bg-gray-50
                  ${rowIndex < table.getRowModel().rows.length - 1 ? 'border-b border-gray-200' : ''}
                `}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <TableCell 
                    key={cell.id} 
                    className={`
                      px-2 md:px-4 
                      py-2 md:py-3
                      min-w-[100px] md:min-w-[120px]
                      ${cellIndex < row.getVisibleCells().length - 1 ? 'border-r border-gray-200' : ''}
                    `}
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
                  className="text-center text-muted-foreground py-4 md:py-6 text-sm md:text-base"
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG - Mobile Responsive */}
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
          className="max-w-[95vw] md:max-w-4xl w-full mx-2 md:mx-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">View Media Plan</DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[50vh] md:h-[60vh] px-2 md:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {Object.entries(formData).map(([key, value]) => {
                const readOnly = MEDIA_PLAN_READ_ONLY_COLUMNS.has(key);

                return (
                  <div key={key} className="flex flex-col gap-1">
                    <label className="text-xs md:text-sm text-muted-foreground whitespace-normal break-words">
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
                      className={`
                        text-xs md:text-sm
                        ${readOnly
                          ? "bg-muted cursor-not-allowed text-muted-foreground"
                          : ""
                        }
                      `}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 md:gap-4 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenDialog(false);
                setFormData({});
              }}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onSubmitMediaPlan(formData);
                setOpenDialog(false);
                setFormData({});
              }}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}