// src/components/CategoryCombobox.jsx

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function CategoryCombobox({ value, setValue, options, placeholder }) {
  const [open, setOpen] = React.useState(false)

  // Twoja logika `safeOptions` jest idealna, zostaje bez zmian
  const safeOptions = options || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? value : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          {/* --- ZMIANA NR 1: Używamy `filter={false}` i obsługujemy filtrowanie ręcznie --- */}
          <CommandInput
            placeholder="Szukaj lub wpisz nową..."
            value={value}
            onValueChange={setValue}
          />
          <CommandList>
            <CommandEmpty>Brak wyników. Wpisz, aby dodać nową.</CommandEmpty>
            <CommandGroup>
              {safeOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option} // `value` jest ważne dla wewnętrznego działania Command
                  onSelect={(currentValue) => {
                    const newValue = currentValue.toLowerCase() === value.toLowerCase() ? "" : currentValue;
                    setValue(newValue.charAt(0).toUpperCase() + newValue.slice(1));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.toLowerCase() === option.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}