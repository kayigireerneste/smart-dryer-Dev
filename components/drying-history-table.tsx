"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

// Mock data for drying history
const mockHistoryData = [
  {
    id: "DRY-001",
    date: "2025-05-08",
    startTime: "09:15",
    endTime: "10:45",
    duration: "1h 30m",
    mode: "Normal",
    energyUsed: "1.2 kWh",
    status: "Completed",
  },
  {
    id: "DRY-002",
    date: "2025-05-07",
    startTime: "14:30",
    endTime: "15:45",
    duration: "1h 15m",
    mode: "Quick",
    energyUsed: "0.9 kWh",
    status: "Completed",
  },
  {
    id: "DRY-003",
    date: "2025-05-06",
    startTime: "18:20",
    endTime: "20:05",
    duration: "1h 45m",
    mode: "Heavy Duty",
    energyUsed: "1.8 kWh",
    status: "Completed",
  },
  {
    id: "DRY-004",
    date: "2025-05-05",
    startTime: "08:00",
    endTime: "09:10",
    duration: "1h 10m",
    mode: "Delicate",
    energyUsed: "0.7 kWh",
    status: "Completed",
  },
  {
    id: "DRY-005",
    date: "2025-05-04",
    startTime: "16:45",
    endTime: "18:15",
    duration: "1h 30m",
    mode: "Normal",
    energyUsed: "1.3 kWh",
    status: "Completed",
  },
  {
    id: "DRY-006",
    date: "2025-05-03",
    startTime: "11:30",
    endTime: "12:40",
    duration: "1h 10m",
    mode: "Quick",
    energyUsed: "0.8 kWh",
    status: "Completed",
  },
  {
    id: "DRY-007",
    date: "2025-05-02",
    startTime: "19:15",
    endTime: "20:45",
    duration: "1h 30m",
    mode: "Normal",
    energyUsed: "1.2 kWh",
    status: "Completed",
  },
]

export default function DryingHistoryTable() {
  const [searchQuery, setSearchQuery] = useState("")

  // Safely filter data with null checks
  const filteredData = mockHistoryData.filter((item) => {
    const query = searchQuery ? searchQuery.toLowerCase() : ""
    const id = item.id ? item.id.toLowerCase() : ""
    const date = item.date || ""
    const mode = item.mode ? item.mode.toLowerCase() : ""

    return id.includes(query) || date.includes(query) || mode.includes(query)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by ID, date, or mode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader className="dark:bg-gray-800">
            <TableRow className="dark:border-gray-700">
              <TableHead className="dark:text-gray-300">ID</TableHead>
              <TableHead className="dark:text-gray-300">Date</TableHead>
              <TableHead className="dark:text-gray-300">Time</TableHead>
              <TableHead className="dark:text-gray-300">Duration</TableHead>
              <TableHead className="dark:text-gray-300">Mode</TableHead>
              <TableHead className="dark:text-gray-300">Energy Used</TableHead>
              <TableHead className="dark:text-gray-300">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="dark:bg-gray-900">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id} className="dark:border-gray-700">
                  <TableCell className="font-medium dark:text-white">{item.id}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.date}</TableCell>
                  <TableCell className="dark:text-gray-300">{`${item.startTime} - ${item.endTime}`}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.duration}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.mode}</TableCell>
                  <TableCell className="dark:text-gray-300">{item.energyUsed}</TableCell>
                  <TableCell className="dark:text-gray-300">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="dark:text-gray-300 dark:hover:bg-gray-800">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                        <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">
                          Export Data
                        </DropdownMenuItem>
                        <DropdownMenuItem className="dark:text-gray-300 dark:focus:bg-gray-700">
                          Repeat Cycle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center dark:text-gray-300">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button variant="outline" size="icon" className="dark:border-gray-700 dark:text-gray-300">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="dark:border-gray-700 dark:text-gray-300">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
