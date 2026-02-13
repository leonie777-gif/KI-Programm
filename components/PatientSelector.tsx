import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function PatientSelector({ value, onValueChange, patients = [] }) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedPatient = patients.find((patient) => patient.id === value)

  const filteredPatients = patients.filter((patient) => {
    const search = searchQuery.toLowerCase()
    return (
      patient.firstName?.toLowerCase().includes(search) ||
      patient.lastName?.toLowerCase().includes(search) ||
      patient.patientNumber?.toLowerCase().includes(search)
    )
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedPatient ? (
            <span>
              {selectedPatient.firstName} {selectedPatient.lastName}
              {selectedPatient.patientNumber && (
                <span className="ml-2 text-muted-foreground">
                  ({selectedPatient.patientNumber})
                </span>
              )}
            </span>
          ) : (
            "Patient auswählen..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Patient suchen..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>Kein Patient gefunden.</CommandEmpty>
            <CommandGroup>
              {filteredPatients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => {
                    onValueChange(patient.id === value ? '' : patient.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>
                      {patient.firstName} {patient.lastName}
                    </span>
                    {patient.patientNumber && (
                      <span className="text-xs text-muted-foreground">
                        {patient.patientNumber}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
