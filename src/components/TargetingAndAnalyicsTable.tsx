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

import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";

type CsvRow = Record<string, string>;

interface Props {
  data: CsvRow[];
  onUpdateByPackage: (payload: CsvRow) => Promise<void>;
  onUpdateByPackageAndPlacement: (payload: CsvRow) => Promise<void>;
}

type EditMode = "PACKAGE" | "PACKAGE_AND_PLACEMENT" | null;

const READ_ONLY_COLUMNS = new Set([
  "RADIA_OR_PRISMA_PACKAGE_NAME",
  "PLACEMENTNAME",
  "BUY_MODEL",
]);

export default function TargetingAndAnalyicsTable({
  data,
  onUpdateByPackage,
  onUpdateByPackageAndPlacement,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [formData, setFormData] = useState<CsvRow>({});

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
      <div className="p-4 border-b font-semibold">
        TARGETING & ANALYTICS TABLE
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
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="border-r border-slate-200 cursor-pointer"
                    onClick={() => {
                      const col = cell.column.id;
                      const rowData = row.original;

                      if (col === "RADIA_OR_PRISMA_PACKAGE_NAME") {
                        setEditMode("PACKAGE");
                        setFormData({ ...rowData });
                      }

                      if (col === "PLACEMENTNAME") {
                        setEditMode("PACKAGE_AND_PLACEMENT");
                        setFormData({ ...rowData });
                      }
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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

          <ScrollArea className="h-[60vh] pr-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => {
                const readOnly = READ_ONLY_COLUMNS.has(key);

                return (
                  <div key={key}>
                    <label className="text-xs text-muted-foreground">
                      {key}
                    </label>
                    <Input
                      value={value ?? ""}
                      readOnly={readOnly}
                      disabled={readOnly}
                      className={
                        readOnly
                          ? "bg-muted cursor-not-allowed text-muted-foreground"
                          : ""
                      }
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
