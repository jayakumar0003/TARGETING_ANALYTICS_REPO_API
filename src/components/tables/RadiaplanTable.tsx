import { useMemo, useState, useEffect } from "react";
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

export default function RadiaplanTable({ data }: Props) {
  // -----------------------------
  // TABLE STATE
  // -----------------------------
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});

  // -----------------------------
  // SELECTED FILTER STATE
  // -----------------------------
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // -----------------------------
  // ALL OPTIONS (RAW)
  // -----------------------------
  const allAgencies = useMemo(
    () => Array.from(new Set(data.map(d => d.AGENCY_NAME).filter(Boolean))),
    [data]
  );

  // -----------------------------
  // INIT: SELECT ALL ON LOAD
  // -----------------------------
  useEffect(() => {
    setSelectedAgencies(allAgencies);
  }, [allAgencies]);

  // -----------------------------
  // FILTER 1: BY AGENCY
  // -----------------------------
  const agencyFilteredData = useMemo(() => {
    if (selectedAgencies.length === 0) return [];
    return data.filter(row =>
      selectedAgencies.includes(row.AGENCY_NAME)
    );
  }, [data, selectedAgencies]);

  // -----------------------------
  // ADVERTISER OPTIONS (FROM AGENCY FILTER)
  // -----------------------------
  const advertiserOptions = useMemo(
    () =>
      Array.from(
        new Set(
          agencyFilteredData
            .map(r => r.ADVERTISER_NAME)
            .filter(Boolean)
        )
      ),
    [agencyFilteredData]
  );

  useEffect(() => {
    setSelectedAdvertisers(advertiserOptions);
  }, [advertiserOptions]);

  // -----------------------------
  // FILTER 2: BY ADVERTISER
  // -----------------------------
  const advertiserFilteredData = useMemo(() => {
    if (selectedAdvertisers.length === 0) return [];
    return agencyFilteredData.filter(row =>
      selectedAdvertisers.includes(row.ADVERTISER_NAME)
    );
  }, [agencyFilteredData, selectedAdvertisers]);

  // -----------------------------
  // CAMPAIGN OPTIONS (FROM ADVERTISER FILTER)
  // -----------------------------
  const campaignOptions = useMemo(
    () =>
      Array.from(
        new Set(
          advertiserFilteredData
            .map(r => r.CAMPAIGN_ID)
            .filter(Boolean)
        )
      ),
    [advertiserFilteredData]
  );

  useEffect(() => {
    setSelectedCampaignIds(campaignOptions);
  }, [campaignOptions]);

  // -----------------------------
  // FILTER 3: BY CAMPAIGN
  // -----------------------------
  const filteredData = useMemo(() => {
    if (selectedCampaignIds.length === 0) return [];
    return advertiserFilteredData.filter(row =>
      selectedCampaignIds.includes(row.CAMPAIGN_ID)
    );
  }, [advertiserFilteredData, selectedCampaignIds]);

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (!filteredData.length) return [];
    return Object.keys(filteredData[0]).map(key => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => (
        <div className="break-words whitespace-normal">
          {getValue<string>() || "—"}
        </div>
      ),
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
      {/* FILTER BAR */}
      <div className="p-4 border-b flex gap-4">
        {/* AGENCY */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Agency Name<ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            {allAgencies.map(agency => (
              <DropdownMenuCheckboxItem
                key={agency}
                checked={selectedAgencies.includes(agency)}
                onCheckedChange={checked =>
                  setSelectedAgencies(prev =>
                    checked
                      ? [...prev, agency]
                      : prev.filter(a => a !== agency)
                  )
                }
                onSelect={e => e.preventDefault()}
              >
                {agency}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ADVERTISER */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Advertiser Name<ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
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
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CAMPAIGN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Campaign ID <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            {campaignOptions.map(id => (
              <DropdownMenuCheckboxItem
                key={id}
                checked={selectedCampaignIds.includes(id)}
                onCheckedChange={checked =>
                  setSelectedCampaignIds(prev =>
                    checked
                      ? [...prev, id]
                      : prev.filter(c => c !== id)
                  )
                }
                onSelect={e => e.preventDefault()}
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
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableHead key={header.id}>
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
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
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
                  className="text-center py-6 text-muted-foreground"
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