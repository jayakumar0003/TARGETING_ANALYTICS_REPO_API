import { useMemo, useState, useEffect, useRef } from "react";
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
import { Check } from "lucide-react";

type CsvRow = Record<string, string>;

interface Props {
  data: CsvRow[];
}

// Custom Dropdown Component
interface DropdownProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onSelectionChange: (selected: string[]) => void;
  disabled?: boolean;
}

function CustomDropdown({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleToggleOption = (option: string) => {
    if (selectedOptions.includes(option)) {
      onSelectionChange(selectedOptions.filter((o) => o !== option));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(options);
    }
  };

  const isAllSelected =
    options.length > 0 && selectedOptions.length === options.length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`px-4 py-2 border-2 border-slate-700 rounded-md flex items-center gap-2 min-w-[150px] justify-between ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : "hover:bg-gray-50 cursor-pointer bg-white"
        }`}
      >
        <span className="text-sm font-medium">{label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
          {/* Select All */}
          <div
            onClick={handleSelectAll}
            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 font-semibold"
          >
            {/* Left checkmark space */}
            <span className="w-5 mr-2 flex items-center justify-center">
              {isAllSelected && <Check className="h-4 w-4 text-slate-800" />}
            </span>

            <span className="text-sm">Select All</span>
          </div>

          {/* Options */}
          {options.map((option) => (
            <div
              key={option}
              onClick={() => handleToggleOption(option)}
              className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {/* Left checkmark space */}
              <span className="w-5 mr-2 flex items-center justify-center">
                {selectedOptions.includes(option) && (
                  <Check className="h-4 w-4 text-slate-800" />
                )}
              </span>

              <span className="text-sm">{option}</span>
            </div>
          ))}

          {options.length === 0 && (
            <div className="px-4 py-2 text-sm text-gray-500">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RadiaplanTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedAgencies, setSelectedAgencies] = useState<string[]>([]);
  const [selectedAdvertisers, setSelectedAdvertisers] = useState<string[]>([]);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);

  // ----------------------------------
  // GET ALL AVAILABLE OPTIONS
  // ----------------------------------
  const agencyOptions = useMemo(
    () => Array.from(new Set(data.map((d) => d.AGENCY_NAME).filter(Boolean))),
    [data]
  );

  const advertiserOptions = useMemo(() => {
    if (selectedAgencies.length === 0) {
      // No agencies selected - show all advertisers
      return Array.from(
        new Set(data.map((d) => d.ADVERTISER_NAME).filter(Boolean))
      );
    }

    // Filter advertisers based on selected agencies
    return Array.from(
      new Set(
        data
          .filter((row) => selectedAgencies.includes(row.AGENCY_NAME))
          .map((r) => r.ADVERTISER_NAME)
          .filter(Boolean)
      )
    );
  }, [data, selectedAgencies]);

  const campaignOptions = useMemo(() => {
    if (selectedAgencies.length === 0 && selectedAdvertisers.length === 0) {
      // Nothing selected - show all campaigns
      return Array.from(
        new Set(data.map((d) => d.CAMPAIGN_ID).filter(Boolean))
      );
    }

    if (selectedAgencies.length === 0) {
      // Only advertisers selected
      return Array.from(
        new Set(
          data
            .filter((row) => selectedAdvertisers.includes(row.ADVERTISER_NAME))
            .map((r) => r.CAMPAIGN_ID)
            .filter(Boolean)
        )
      );
    }

    if (selectedAdvertisers.length === 0) {
      // Only agencies selected
      return Array.from(
        new Set(
          data
            .filter((row) => selectedAgencies.includes(row.AGENCY_NAME))
            .map((r) => r.CAMPAIGN_ID)
            .filter(Boolean)
        )
      );
    }

    // Both selected - filter by both
    return Array.from(
      new Set(
        data
          .filter(
            (row) =>
              selectedAgencies.includes(row.AGENCY_NAME) &&
              selectedAdvertisers.includes(row.ADVERTISER_NAME)
          )
          .map((r) => r.CAMPAIGN_ID)
          .filter(Boolean)
      )
    );
  }, [data, selectedAgencies, selectedAdvertisers]);

  // Initialize with all options selected ONCE
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && agencyOptions.length > 0) {
      setSelectedAgencies(agencyOptions);
      setSelectedAdvertisers(advertiserOptions);
      setSelectedCampaignIds(campaignOptions);
      initialized.current = true;
    }
  }, [agencyOptions.length]);

  // ----------------------------------
  // APPLY FILTERS TO GET FINAL DATA
  // ----------------------------------
  const filteredData = useMemo(() => {
    let result = data;

    // Agency filter
    if (agencyOptions.length > 0) {
      if (selectedAgencies.length === 0) return [];
      result = result.filter((row) =>
        selectedAgencies.includes(row.AGENCY_NAME)
      );
    }

    // Advertiser filter
    if (advertiserOptions.length > 0) {
      if (selectedAdvertisers.length === 0) return [];
      result = result.filter((row) =>
        selectedAdvertisers.includes(row.ADVERTISER_NAME)
      );
    }

    // Campaign filter
    if (campaignOptions.length > 0) {
      if (selectedCampaignIds.length === 0) return [];
      result = result.filter((row) =>
        selectedCampaignIds.includes(row.CAMPAIGN_ID)
      );
    }

    return result;
  }, [
    data,
    agencyOptions,
    advertiserOptions,
    campaignOptions,
    selectedAgencies,
    selectedAdvertisers,
    selectedCampaignIds,
  ]);
  // ----------------------------------
  // TABLE COLUMNS
  // ----------------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => (
        <div className="break-words whitespace-normal">
          {getValue<string>() || "—"}
        </div>
      ),
    }));
  }, [data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      {/* FILTER BAR */}
      <div className="p-4 border-b flex gap-4 flex-wrap">
        <CustomDropdown
          label="Agency Name"
          options={agencyOptions}
          selectedOptions={selectedAgencies}
          onSelectionChange={setSelectedAgencies}
          disabled={selectedAdvertisers.length === 0 || selectedCampaignIds.length === 0}
        />

        <CustomDropdown
          label="Advertiser Name"
          options={advertiserOptions}
          selectedOptions={selectedAdvertisers}
          onSelectionChange={setSelectedAdvertisers}
          disabled={selectedAgencies.length === 0 || selectedCampaignIds.length === 0}
        />

        <CustomDropdown
          label="Campaign ID"
          options={campaignOptions}
          selectedOptions={selectedCampaignIds}
          onSelectionChange={setSelectedCampaignIds}
          disabled={selectedAgencies.length === 0 || selectedAdvertisers.length === 0 }
        />
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
                  className="text-center py-6 text-gray-500"
                >
                  No data available with current filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
