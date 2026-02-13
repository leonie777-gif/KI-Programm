import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  date: z.date({
    required_error: "Bitte wählen Sie ein Datum aus.",
  }),
  phase: z.string({
    required_error: "Bitte wählen Sie eine Phase aus.",
  }),
  duration: z.string().min(1, "Dauer ist erforderlich"),
  mood: z.string({
    required_error: "Bitte wählen Sie eine Stimmung aus.",
  }),
  separation: z.string().optional(),
  activities: z.string().min(10, "Bitte beschreiben Sie die Aktivitäten (mind. 10 Zeichen)"),
  eating: z.string().optional(),
  sleeping: z.string().optional(),
  notes: z.string().optional(),
})

export default function Eingewoehnungsform({ onSubmit, initialData = null }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      date: new Date(),
      phase: '',
      duration: '',
      mood: '',
      separation: '',
      activities: '',
      eating: '',
      sleeping: '',
      notes: '',
    },
  })

  const handleSubmit = (values) => {
    onSubmit(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Datum</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: de })
                        ) : (
                          <span>Datum auswählen</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={de}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phase"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Eingewöhnungsphase</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Phase auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="grundphase">Grundphase</SelectItem>
                    <SelectItem value="stabilisierung">Stabilisierungsphase</SelectItem>
                    <SelectItem value="schlussphase">Schlussphase</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aufenthaltsdauer</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 2 Stunden" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stimmung</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Stimmung auswählen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sehr_gut">Sehr gut</SelectItem>
                    <SelectItem value="gut">Gut</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="unsicher">Unsicher</SelectItem>
                    <SelectItem value="weinerlich">Weinerlich</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="separation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trennungsverhalten</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Wie verlief die Trennung von der Bezugsperson?"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktivitäten und Verhalten</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Beschreiben Sie die Aktivitäten und das Verhalten des Kindes..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Was hat das Kind gemacht? Wie war die Interaktion mit anderen?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="eating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Essen/Trinken</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Wie war das Essverhalten?"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sleeping"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schlafen/Ausruhen</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Wie war das Schlafverhalten?"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weitere Anmerkungen</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Besonderheiten, Auffälligkeiten, Hinweise für die Eltern..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="submit">Speichern</Button>
        </div>
      </form>
    </Form>
  )
}