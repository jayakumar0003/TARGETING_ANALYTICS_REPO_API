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
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type CsvRow = Record<string, string>;

const SAMPLE_AGENCIES = [
  "EssenceMediacom (United States)",
  "Mindshare (United States)",
  "Wavemaker (United States)",
  "Mindshare Interaction (United States)",
  "Mediacom (United States)",
  "Direct to Advertiser (United States)",
];

const SAMPLE_ADVERTISERS = [
  "Rent-A-Center - US",
  "Mizkan - US",
  "New York Stock Exchange - US",
  "Citizens Bank - US",
  "Ally Bank - US",
  "Mark Anthony Brands - US",
];

const PACKAGE_READ_ONLY_COLUMNS = new Set([
  "RADIA_OR_PRISMA_PACKAGE_NAME",
  "PLACEMENTNAME",
  "LINE_ITEM_BREAK_DSP_SPECIFIC",
  "BOOLEAN_LOGIC",
  "TARGETING_BLURB",
  "AUDIENCE_INFO",
  "DEMOGRAPHICS",
  "DATA_SOURCE_DSP",
  "PRIMARY_KPI",
  "BENCHMARKS",
  "DEAL_NAME",
  "DEAL_IDS",
  "FLOOR_PRICE",
  "DEVICE",
  "BUY_MODEL",
  "FREQUENCY_CAP",
  "GEO",
  "PIXELS_FLOODLIGHT",
]);

const PACKAGE_AND_PLACEMENT_READ_ONLY_COLUMNS = new Set([
  "RADIA_OR_PRISMA_PACKAGE_NAME",
  "PLACEMENTNAME",
  "TACTIC",
  "BUY_MODEL",
  "BRAND_SAFETY",
  "BLS_MEASUREMENT",
  "LIVE_DATE",
]);

interface Props {
  data: CsvRow[];
  onUpdateByPackage: (payload: CsvRow) => Promise<void>;
  onUpdateByPackageAndPlacement: (payload: CsvRow) => Promise<void>;
}

type EditMode = "PACKAGE" | "PACKAGE_AND_PLACEMENT" | null;

export default function TargetingAndAnalyicsTable({
  data,
  onUpdateByPackage,
  onUpdateByPackageAndPlacement,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [formData, setFormData] = useState<CsvRow>({});

  const [selectedAgencies, setSelectedAgencies] =
    useState<string[]>(SAMPLE_AGENCIES);
  const [selectedAdvertisers, setSelectedAdvertisers] =
    useState<string[]>(SAMPLE_ADVERTISERS);

  function handleCellClick(col: string, rowData: CsvRow) {
    if (col === "RADIA_OR_PRISMA_PACKAGE_NAME") {
      setEditMode("PACKAGE");
      setFormData({ ...rowData }); // ✅ full row
      return;
    }

    if (col === "PLACEMENTNAME") {
      setEditMode("PACKAGE_AND_PLACEMENT");
      setFormData({ ...rowData }); // ✅ full row
    }
  }

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (!data.length) return [];

    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row }) => {
        const value = row.getValue(key) as string;
        return (
          <div className="whitespace-normal break-words text-xs md:text-sm min-h-[40px] flex items-center">
            {value || "—"}
          </div>
        );
      },
    }));
  }, [data]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="overflow-hidden">
      {/* FILTER BAR - Mobile Responsive */}
      <div className="p-2 md:p-4 border-b flex items-center gap-2 md:gap-4 flex-wrap">
        {/* ================= AGENCY NAME ================= */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center border-2 border-slate-700 gap-1 md:gap-2 text-xs md:text-base px-3 md:px-4 py-1.5 md:py-2 w-full sm:w-auto"
            >
              Agency Name
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 md:w-72 max-h-56 md:max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={selectedAgencies.length === SAMPLE_AGENCIES.length}
              onCheckedChange={(checked) =>
                setSelectedAgencies(checked ? SAMPLE_AGENCIES : [])
              }
              onSelect={(e) => e.preventDefault()}
              className="font-semibold text-xs md:text-sm"
            >
              Select All
            </DropdownMenuCheckboxItem>

            <div className="my-1 h-px bg-slate-200" />

            {SAMPLE_AGENCIES.map((agency) => (
              <DropdownMenuCheckboxItem
                key={agency}
                checked={selectedAgencies.includes(agency)}
                onCheckedChange={(checked) =>
                  setSelectedAgencies((prev) =>
                    checked
                      ? [...prev, agency]
                      : prev.filter((a) => a !== agency)
                  )
                }
                onSelect={(e) => e.preventDefault()}
                className="text-xs md:text-sm"
              >
                {agency}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ================= ADVERTISER NAME ================= */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center border-2 border-slate-700 gap-1 md:gap-2 text-xs md:text-base px-3 md:px-4 py-1.5 md:py-2 w-full sm:w-auto"
            >
              Advertiser Name
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-64 md:w-72 max-h-56 md:max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={selectedAdvertisers.length === SAMPLE_ADVERTISERS.length}
              onCheckedChange={(checked) =>
                setSelectedAdvertisers(checked ? SAMPLE_ADVERTISERS : [])
              }
              onSelect={(e) => e.preventDefault()}
              className="font-semibold text-xs md:text-sm"
            >
              Select All
            </DropdownMenuCheckboxItem>

            <div className="my-1 h-px bg-slate-200" />

            {SAMPLE_ADVERTISERS.map((adv) => (
              <DropdownMenuCheckboxItem
                key={adv}
                checked={selectedAdvertisers.includes(adv)}
                onCheckedChange={(checked) =>
                  setSelectedAdvertisers((prev) =>
                    checked ? [...prev, adv] : prev.filter((a) => a !== adv)
                  )
                }
                onSelect={(e) => e.preventDefault()}
                className="text-xs md:text-sm"
              >
                {adv}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* TABLE - Mobile Responsive */}
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
                {row.getVisibleCells().map((cell, cellIndex) => {
                  const columnId = cell.column.id;

                  return (
                    <TableCell
                      key={cell.id}
                      className={`
                        border-r border-slate-200 
                        cursor-pointer
                        px-2 md:px-4
                        py-2 md:py-3
                        min-w-[100px] md:min-w-[120px]
                        ${cellIndex === row.getVisibleCells().length - 1 ? 'border-r-0' : ''}
                      `}
                      onClick={() => handleCellClick(columnId, row.original)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* EDIT FORM - Mobile Responsive */}
      <Dialog
        open={!!editMode}
        onOpenChange={(open) => {
          if (!open) {
            setEditMode(null);
            setFormData({});
          }
        }}
      >
        <DialogContent
          className="max-w-[95vw] md:max-w-4xl w-full mx-2 md:mx-auto"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-lg md:text-xl">
              {editMode === "PACKAGE"
                ? "Edit Based On Package"
                : "Edit Based On Package & Placement"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[50vh] md:h-[60vh] px-2 md:px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 md:gap-x-4 gap-y-4 md:gap-y-6">
              {Object.entries(formData).map(([key, value]) => {
                const readOnly =
                  editMode === "PACKAGE"
                    ? PACKAGE_READ_ONLY_COLUMNS.has(key)
                    : PACKAGE_AND_PLACEMENT_READ_ONLY_COLUMNS.has(key);

                return (
                  <div key={key} className="flex flex-col gap-1 md:gap-2 pb-1 px-1">
                    <label className="text-xs md:text-sm text-muted-foreground whitespace-normal break-words">
                      {key}
                    </label>

                    <Input
                      type={key === "LIVE_DATE" ? "date" : "text"}
                      value={value ?? ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`
                        focus-visible:ring-offset-2 
                        text-xs md:text-sm
                        ${readOnly
                          ? "bg-muted cursor-not-allowed text-muted-foreground"
                          : ""
                        }
                      `}
                      onChange={(e) => {
                        if (!readOnly) {
                          setFormData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }));
                        }
                      }}
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
                setEditMode(null);
                setFormData({});
              }}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  if (editMode === "PACKAGE") {
                    await onUpdateByPackage(formData);
                  } else {
                    await onUpdateByPackageAndPlacement(formData);
                  }

                  setEditMode(null);
                  setFormData({});
                } catch {
                  alert("Update failed");
                }
              }}
              className="w-full sm:w-auto text-xs md:text-sm"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}