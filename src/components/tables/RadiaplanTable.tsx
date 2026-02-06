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
  // ----------------------------------
  // TABLE STATE
  // ----------------------------------
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({});

  // ----------------------------------
  // FILTER STATE
  // ----------------------------------
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // ----------------------------------
  // AGENCY OPTIONS (RAW)
  // ----------------------------------
  const agencyOptions = useMemo(
    () =>
      Array.from(
        new Set(data.map(d => d.AGENCY_NAME).filter(Boolean))
      ),
    [data]
  );

  // Select all agencies on load
  useEffect(() => {
    setSelectedAgencies(agencyOptions);
  }, [agencyOptions]);

  // ----------------------------------
  // FILTER 1: AGENCY
  // ----------------------------------
  const agencyFilteredData = useMemo(() => {
    if (selectedAgencies.length === 0) return [];
    return data.filter(row =>
      selectedAgencies.includes(row.AGENCY_NAME)
    );
  }, [data, selectedAgencies]);

  // ----------------------------------
  // ADVERTISER OPTIONS (FROM AGENCY)
  // ----------------------------------
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

  // Clamp advertiser selection
  useEffect(() => {
    setSelectedAdvertisers(prev => {
      const valid = prev.filter(a => advertiserOptions.includes(a));
      return valid.length > 0 ? valid : advertiserOptions;
    });
  }, [advertiserOptions]);

  // ----------------------------------
  // FILTER 2: ADVERTISER
  // ----------------------------------
  const advertiserFilteredData = useMemo(() => {
    if (selectedAdvertisers.length === 0) return [];
    return agencyFilteredData.filter(row =>
      selectedAdvertisers.includes(row.ADVERTISER_NAME)
    );
  }, [agencyFilteredData, selectedAdvertisers]);

  // ----------------------------------
  // CAMPAIGN OPTIONS (FROM ADVERTISER)
  // ----------------------------------
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

  // Clamp campaign selection
  useEffect(() => {
    setSelectedCampaignIds(prev => {
      const valid = prev.filter(c => campaignOptions.includes(c));
      return valid.length > 0 ? valid : campaignOptions;
    });
  }, [campaignOptions]);

  // ----------------------------------
  // FILTER 3: CAMPAIGN (FINAL DATA)
  // ----------------------------------
  const filteredData = useMemo(() => {
    if (selectedCampaignIds.length === 0) return [];
    return advertiserFilteredData.filter(row =>
      selectedCampaignIds.includes(row.CAMPAIGN_ID)
    );
  }, [advertiserFilteredData, selectedCampaignIds]);

  // ----------------------------------
  // SELECT ALL STATES
  // ----------------------------------
  const isAllAgenciesSelected =
    agencyOptions.length > 0 &&
    selectedAgencies.length === agencyOptions.length;

  const isAllAdvertisersSelected =
    advertiserOptions.length > 0 &&
    selectedAdvertisers.length === advertiserOptions.length;

  const isAllCampaignsSelected =
    campaignOptions.length > 0 &&
    selectedCampaignIds.length === campaignOptions.length;

  // ----------------------------------
  // TABLE COLUMNS
  // ----------------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (filteredData.length === 0) return [];
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

  // ----------------------------------
  // RENDER
  // ----------------------------------
  return (
    <Card>
      {/* FILTER BAR */}
      <div className="p-4 border-b flex gap-4 flex-wrap">

        {/* AGENCY */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-2 border-slate-700">
              Agency Name <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={isAllAgenciesSelected}
              onCheckedChange={checked =>
                setSelectedAgencies(checked ? agencyOptions : [])
              }
              onSelect={e => e.preventDefault()}
              className="font-semibold"
            >
              Select All
            </DropdownMenuCheckboxItem>
            <div className="my-1 h-px bg-slate-200" />
            {agencyOptions.map(a => (
              <DropdownMenuCheckboxItem
                key={a}
                checked={selectedAgencies.includes(a)}
                onCheckedChange={checked =>
                  setSelectedAgencies(prev =>
                    checked ? [...prev, a] : prev.filter(x => x !== a)
                  )
                }
                onSelect={e => e.preventDefault()}
              >
                {a}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ADVERTISER */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-2 border-slate-700">
              Advertiser Name <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={isAllAdvertisersSelected}
              onCheckedChange={checked =>
                setSelectedAdvertisers(checked ? advertiserOptions : [])
              }
              onSelect={e => e.preventDefault()}
              className="font-semibold"
            >
              Select All
            </DropdownMenuCheckboxItem>
            <div className="my-1 h-px bg-slate-200" />
            {advertiserOptions.map(a => (
              <DropdownMenuCheckboxItem
                key={a}
                checked={selectedAdvertisers.includes(a)}
                onCheckedChange={checked =>
                  setSelectedAdvertisers(prev =>
                    checked ? [...prev, a] : prev.filter(x => x !== a)
                  )
                }
                onSelect={e => e.preventDefault()}
              >
                {a}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CAMPAIGN */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-2 border-slate-700">
              Campaign ID <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-72 max-h-64 overflow-y-auto">
            <DropdownMenuCheckboxItem
              checked={isAllCampaignsSelected}
              onCheckedChange={checked =>
                setSelectedCampaignIds(checked ? campaignOptions : [])
              }
              onSelect={e => e.preventDefault()}
              className="font-semibold"
            >
              Select All
            </DropdownMenuCheckboxItem>
            <div className="my-1 h-px bg-slate-200" />
            {campaignOptions.map(c => (
              <DropdownMenuCheckboxItem
                key={c}
                checked={selectedCampaignIds.includes(c)}
                onCheckedChange={checked =>
                  setSelectedCampaignIds(prev =>
                    checked ? [...prev, c] : prev.filter(x => x !== c)
                  )
                }
                onSelect={e => e.preventDefault()}
              >
                {c}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* TABLE */}
      <div className="overflow-auto">
        <Table>
          <TableHeader className="bg-slate-800">
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id}>
                {hg.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="text-white font-bold uppercase"
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
                <TableCell colSpan={columns.length} className="text-center py-6">
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
