"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCustomers } from "@/lib/actions/customer.actions"
import { UserCircle, X, Search } from "lucide-react"
import useSWR from "swr"

interface Customer {
  _id: string
  name: string
  phone: string
}

interface CustomerSearchProps {
  selectedCustomer: Customer | null
  onSelect: (customer: Customer | null) => void
}

export function CustomerSearch({ selectedCustomer, onSelect }: CustomerSearchProps) {
  const [search, setSearch] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const { data } = useSWR(isSearching && search.length >= 2 ? ["customers", search] : null, () =>
    getCustomers({ search, limit: 5 }),
  )

  const customers = data?.data?.customers || []

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <div className="flex items-center gap-3">
          <UserCircle className="h-8 w-8 text-muted-foreground" />
          <div>
            <div className="font-medium">{selectedCustomer.name}</div>
            <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onSelect(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">Customer (Optional)</Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsSearching(true)}
          className="pl-9"
        />
      </div>

      {isSearching && search.length >= 2 && customers.length > 0 && (
        <div className="border rounded-lg divide-y">
          {customers.map((customer: Customer) => (
            <button
              key={customer._id}
              type="button"
              onClick={() => {
                onSelect(customer)
                setSearch("")
                setIsSearching(false)
              }}
              className="w-full px-3 py-2 text-left hover:bg-muted transition-colors"
            >
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-muted-foreground">{customer.phone}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
