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

const PACKAGE_FIELDS = [
  "RADIA_OR_PRISMA_PACKAGE_NAME",
  "TACTIC",
  "BUY_MODEL",
  "BRAND_SAFETY",
  "BLS_MEASUREMENT",
  "LIVE_DATE",
] as const;

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
        return <div className="break-words">{value || "—"}</div>;
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
    <Card>
      {/* hear filter*/}
      <div className="p-4 border-b flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Agency Name
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          {/* <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            {advertiserOptions.map(adv => (
              <DropdownMenuCheckboxItem
                key={adv}
                checked={selectedAdvertisers.includes(adv)}
                onCheckedChange={checked =>
                  setSelectedAdvertisers(prev =>
                    checked
                      ? [...prev, adv]
                      : prev.filter(a => a !== adv)
                  )
                }
                onSelect={e => e.preventDefault()}
              >
                {adv}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent> */}
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 text-base px-4 py-2"
            >
              Campaign ID
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          {/* <DropdownMenuContent
        align="start"
        className="w-72 max-h-64 overflow-y-auto"
      >
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
          onSelect={(e) => e.preventDefault()} // ⭐ KEEP DROPDOWN OPEN
        >
          {id}
        </DropdownMenuCheckboxItem>
        
        ))}
      </DropdownMenuContent> */}
        </DropdownMenu>
      </div>
      {/* TABLE */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="border-r border-slate-200 cursor-pointer"
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
                {row.getVisibleCells().map((cell) => {
                  const columnId = cell.column.id;

                  return (
                    <TableCell
                      key={cell.id}
                      className="border-r border-slate-200 cursor-pointer"
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

      {/* EDIT FORM */}
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
          className="max-w-4xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {editMode === "PACKAGE"
                ? "Edit Package"
                : "Edit Package & Placement"}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[60vh] px-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {Object.entries(formData).map(([key, value]) => {
                const readOnly =
                  editMode === "PACKAGE"
                    ? PACKAGE_READ_ONLY_COLUMNS.has(key)
                    : PACKAGE_AND_PLACEMENT_READ_ONLY_COLUMNS.has(key);

                return (
                  <div key={key} className="flex flex-col gap-2 pb-1 px-1">
                    <label className="text-xs text-muted-foreground">
                      {key}
                    </label>

                    <Input
                      value={value ?? ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={`focus-visible:ring-offset-2 ${
                        readOnly
                          ? "bg-muted cursor-not-allowed text-muted-foreground"
                          : ""
                      }`}
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

          <DialogFooter>
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
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
