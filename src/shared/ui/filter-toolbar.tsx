"use client"

import { useState } from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Search } from "lucide-react"

interface FilterOption {
  id: string
  label: string
  type: "text" | "select" | "date"
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface FilterToolbarProps {
  filters: FilterOption[]
  onSearch: (filters: Record<string, string>) => void
}

export function FilterToolbar({ filters, onSearch }: FilterToolbarProps) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({})

  const handleFilterChange = (id: string, value: string) => {
    setFilterValues((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSearch = () => {
    // Convert "all" values to empty strings or null for the API
    const apiFilters = Object.entries(filterValues).reduce(
      (acc, [key, value]) => {
        acc[key] = value === "all" ? "" : value
        return acc
      },
      {} as Record<string, string>,
    )

    onSearch(apiFilters)
  }

  return (
    <div className="bg-white p-4 rounded-md border mb-4 flex flex-wrap gap-2 items-center">
      {filters.map((filter) => (
        <div key={filter.id} className="flex-1 min-w-[200px]">
          {filter.type === "text" && (
            <Input
              placeholder={filter.placeholder || filter.label}
              value={filterValues[filter.id] || ""}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="h-10"
            />
          )}

          {filter.type === "select" && (
            <Select
              value={filterValues[filter.id] || ""}
              onValueChange={(value) => handleFilterChange(filter.id, value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </SelectTrigger>
              <SelectContent>
                {filter.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {filter.type === "date" && (
            <Input
              type="date"
              value={filterValues[filter.id] || ""}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
              className="h-10"
            />
          )}
        </div>
      ))}

      <div className="flex-none">
        <Button onClick={handleSearch} className="h-10">
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
      </div>
    </div>
  )
}
