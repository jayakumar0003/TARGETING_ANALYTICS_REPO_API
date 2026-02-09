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
    // If all options are already selected, deselect all
    if (selectedOptions.length === options.length) {
      onSelectionChange([]);
    } else {
      // Otherwise, select all options
      onSelectionChange([...options]);
    }
  };

  const isAllSelected =
    options.length > 0 && selectedOptions.length === options.length;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          px-3 md:px-4 
          py-1.5 md:py-2 
          border-2 border-slate-700 
          rounded-md 
          flex items-center gap-1 md:gap-2 
          min-w-[120px] md:min-w-[150px] 
          justify-between 
          text-xs md:text-sm
          ${disabled
            ? "opacity-50 cursor-not-allowed bg-gray-100"
            : "hover:bg-gray-50 cursor-pointer bg-white"
          }
        `}
      >
        <span className="font-medium truncate">{label}</span>
        <svg
          className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${
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
        <div className="absolute z-50 mt-1 w-64 md:w-72 bg-white border border-gray-200 rounded-md shadow-lg max-h-56 md:max-h-64 overflow-y-auto">
          {/* Select All - Always shows "Select All" */}
          <div
            onClick={handleSelectAll}
            className="flex items-center px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 font-semibold"
          >
            {/* Left checkmark space */}
            <span className="w-4 md:w-5 mr-1 md:mr-2 flex items-center justify-center">
              {isAllSelected && <Check className="h-3 w-3 md:h-4 md:w-4 text-slate-800" />}
            </span>
            <span className="text-xs md:text-sm">Select All</span>
          </div>

          {/* Divider line */}
          <div className="border-t border-gray-200"></div>

          {/* Options */}
          {options.map((option) => (
            <div key={option}>
              <div
                onClick={() => handleToggleOption(option)}
                className="flex items-center px-3 md:px-4 py-1.5 md:py-2 hover:bg-gray-100 cursor-pointer"
              >
                {/* Left checkmark space */}
                <span className="w-4 md:w-5 mr-1 md:mr-2 flex items-center justify-center">
                  {selectedOptions.includes(option) && (
                    <Check className="h-3 w-3 md:h-4 md:w-4 text-slate-800" />
                  )}
                </span>
                <span className="text-xs md:text-sm truncate">{option}</span>
              </div>
            </div>
          ))}

          {options.length === 0 && (
            <div className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm text-gray-500">
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
  // GET ALL AVAILABLE OPTIONS WITH REVERSE FILTERING
  // ----------------------------------
  
  // 1. Campaign ID options - filtered based on ALL previous selections
  const campaignOptions = useMemo(() => {
    let filteredData = data;
    
    // Filter by selected agencies if any
    if (selectedAgencies.length > 0) {
      filteredData = filteredData.filter(row => 
        selectedAgencies.includes(row.AGENCY_NAME)
      );
    }
    
    // Filter by selected advertisers if any
    if (selectedAdvertisers.length > 0) {
      filteredData = filteredData.filter(row => 
        selectedAdvertisers.includes(row.ADVERTISER_NAME)
      );
    }
    
    return Array.from(
      new Set(filteredData.map((d) => d.CAMPAIGN_ID).filter(Boolean))
    );
  }, [data, selectedAgencies, selectedAdvertisers]);

  // 2. Advertiser options - filtered based on selected agencies AND campaigns
  const advertiserOptions = useMemo(() => {
    let filteredData = data;
    
    // Filter by selected agencies if any
    if (selectedAgencies.length > 0) {
      filteredData = filteredData.filter(row => 
        selectedAgencies.includes(row.AGENCY_NAME)
      );
    }
    
    // Filter by selected campaigns if any
    if (selectedCampaignIds.length > 0) {
      filteredData = filteredData.filter(row => 
        selectedCampaignIds.includes(row.CAMPAIGN_ID)
      );
    }
    
    return Array.from(
      new Set(filteredData.map((d) => d.ADVERTISER_NAME).filter(Boolean))
    );
  }, [data, selectedAgencies, selectedCampaignIds]);

  // 3. Agency options - filtered based on selected advertisers AND campaigns
  const agencyOptions = useMemo(() => {
    let filteredData = data;
    
    // Filter by selected advertisers if any
    if (selectedAdvertisers.length > 0) {
      filteredData = filteredData.filter(row => 
        selectedAdvertisers.includes(row.ADVERTISER_NAME)
      );
    }
    
    // Filter by selected campaigns if any
    if (selectedCampaignIds.length > 0) {
      filteredData = filteredData.filter(row => 
        selectedCampaignIds.includes(row.CAMPAIGN_ID)
      );
    }
    
    return Array.from(
      new Set(filteredData.map((d) => d.AGENCY_NAME).filter(Boolean))
    );
  }, [data, selectedAdvertisers, selectedCampaignIds]);

  // Initialize with all options selected ONCE when data loads
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && data.length > 0) {
      // Get ALL options initially
      const allAgencies = Array.from(
        new Set(data.map((d) => d.AGENCY_NAME).filter(Boolean))
      );
      const allAdvertisers = Array.from(
        new Set(data.map((d) => d.ADVERTISER_NAME).filter(Boolean))
      );
      const allCampaigns = Array.from(
        new Set(data.map((d) => d.CAMPAIGN_ID).filter(Boolean))
      );
      
      setSelectedAgencies(allAgencies);
      setSelectedAdvertisers(allAdvertisers);
      setSelectedCampaignIds(allCampaigns);
      initialized.current = true;
    }
  }, [data]);

  // ----------------------------------
  // APPLY FILTERS TO GET FINAL DATA - UPDATED LOGIC
  // ----------------------------------
  const filteredData = useMemo(() => {
    // If ANY filter has NO selections, return empty array (show "No data")
    // This ensures when you deselect all in any filter, no data shows
    if (selectedAgencies.length === 0 || selectedAdvertisers.length === 0 || selectedCampaignIds.length === 0) {
      return [];
    }
    
    return data.filter(row => {
      // Agency filter - if agencies are selected, check if row matches
      if (selectedAgencies.length > 0 && !selectedAgencies.includes(row.AGENCY_NAME)) {
        return false;
      }
      
      // Advertiser filter - if advertisers are selected, check if row matches
      if (selectedAdvertisers.length > 0 && !selectedAdvertisers.includes(row.ADVERTISER_NAME)) {
        return false;
      }
      
      // Campaign filter - if campaigns are selected, check if row matches
      if (selectedCampaignIds.length > 0 && !selectedCampaignIds.includes(row.CAMPAIGN_ID)) {
        return false;
      }
      
      return true;
    });
  }, [data, selectedAgencies, selectedAdvertisers, selectedCampaignIds]);

  // ----------------------------------
  // TABLE COLUMNS WITH SEPARATION LINES
  // ----------------------------------
  const columns = useMemo<ColumnDef<CsvRow>[]>(() => {
    if (data.length === 0) return [];
    const firstRow = data[0];
    return Object.keys(firstRow).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ getValue }) => (
        <div className="break-words whitespace-normal text-xs md:text-sm">
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
    <Card className="overflow-hidden">
      {/* FILTER BAR - Mobile Responsive */}
      <div className="p-2 md:p-4 border-b flex gap-2 md:gap-4 flex-wrap">
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
          disabled={selectedAgencies.length === 0 || selectedAdvertisers.length === 0}
        />
      </div>

      {/* TABLE WITH COLUMN SEPARATION LINES - Mobile Responsive */}
      <div className="overflow-auto -mx-1 md:mx-0">
        <Table className="border-separate border-spacing-0 w-full">
          <TableHeader className="bg-slate-800">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="border-0">
                {hg.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className={`
                      text-white 
                      font-bold 
                      uppercase 
                      text-center 
                      p-2 md:p-4 
                      text-xs md:text-sm
                      relative 
                      min-w-[80px] md:min-w-[100px]
                      ${index < hg.headers.length - 1 ? 'border-r border-gray-600' : ''}
                    `}
                  >
                    <div className="truncate">
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
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, rowIndex) => (
                <TableRow 
                  key={row.id} 
                  className={`
                    hover:bg-gray-50
                    ${rowIndex < table.getRowModel().rows.length - 1 ? 'border-b border-gray-200' : ''}
                  `}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell 
                      key={cell.id} 
                      className={`
                        p-2 md:p-4 
                        relative 
                        text-xs md:text-sm
                        min-w-[80px] md:min-w-[100px]
                        ${index < row.getVisibleCells().length - 1 ? 'border-r border-gray-200' : ''}
                      `}
                    >
                      <div className="truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length || 1}
                  className="text-center py-4 md:py-6 text-gray-500 text-xs md:text-sm"
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