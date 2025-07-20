// src/components/ProductCombobox.jsx
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function ProductCombobox({ products, value, onSelect, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const selectedProduct = products.find(p => String(p.id) === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selectedProduct ? selectedProduct.nazwa : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Wyszukaj produkt..." />
          <CommandList>
            <CommandEmpty>Nie znaleziono produktu.</CommandEmpty>
            {products.map((product) => (
              <CommandItem
                key={product.id}
                value={product.nazwa}
                onSelect={() => {
                  onSelect(String(product.id));
                  setOpen(false);
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === String(product.id) ? "opacity-100" : "opacity-0")} />
                {product.nazwa} (Stan: {product.ilosc} {product.jednostka})
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}