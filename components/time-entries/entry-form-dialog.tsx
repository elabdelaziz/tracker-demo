'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createTimeEntry, updateTimeEntry } from '@/actions/time-entries'
import { TimeEntry } from '@/types/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Clock, Calendar } from 'lucide-react'
import {
  calculateDuration,
  getLocalDateString,
  getLocalTimeString,
} from '@/lib/time-helpers'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { useRateLimit } from '@/components/providers/rate-limit-provider'

const entrySchema = z
  .object({
    taskId: z.coerce.number().min(1, 'Task ID is required'),
    comment: z.string().min(1, 'Comment is required'),
    startDate: z.string().min(1, 'Start date is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endDate: z.string().min(1, 'End date is required'),
    endTime: z.string().min(1, 'End time is required'),
  })
  .refine(
    (data) => {
      const start = new Date(`${data.startDate}T${data.startTime}`)
      const end = new Date(`${data.endDate}T${data.endTime}`)
      return end > start
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const end = new Date(`${data.endDate}T${data.endTime}`)
      return end <= new Date()
    },
    {
      message: 'Cannot create time entries for the future',
      path: ['endTime'],
    }
  )

type EntryFormValues = z.infer<typeof entrySchema>

interface EntryFormDialogProps {
  entry?: TimeEntry
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EntryFormDialog({
  entry,
  trigger,
  open,
  onOpenChange,
}: EntryFormDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const { checkRateLimit, reportRateLimit } = useRateLimit()

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen

  const getDefaultValues = () => {
    if (entry) {
      const startDate = new Date(entry.start)
      const endDate = new Date(entry.end)
      return {
        taskId: entry.taskId,
        comment: entry.comment,
        startDate: getLocalDateString(startDate),
        startTime: getLocalTimeString(startDate),
        endDate: getLocalDateString(endDate),
        endTime: getLocalTimeString(endDate),
      }
    }
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      taskId: '' as any,
      comment: '',
      startDate: getLocalDateString(oneHourAgo),
      startTime: getLocalTimeString(oneHourAgo),
      endDate: getLocalDateString(now),
      endTime: getLocalTimeString(now),
    }
  }

  const form = useForm<EntryFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(entrySchema) as any,
    defaultValues: getDefaultValues(),
  })

  // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form's watch() is intentionally reactive
  const watchStartDate = form.watch('startDate')
  const watchStartTime = form.watch('startTime')
  const watchEndDate = form.watch('endDate')
  const watchEndTime = form.watch('endTime')
  const duration = useMemo(
    () =>
      calculateDuration(
        watchStartDate,
        watchStartTime,
        watchEndDate,
        watchEndTime
      ),
    [watchStartDate, watchStartTime, watchEndDate, watchEndTime]
  )

  useEffect(() => {
    if (entry) {
      const startDate = new Date(entry.start)
      const endDate = new Date(entry.end)
      form.reset({
        taskId: entry.taskId,
        comment: entry.comment,
        startDate: getLocalDateString(startDate),
        startTime: getLocalTimeString(startDate),
        endDate: getLocalDateString(endDate),
        endTime: getLocalTimeString(endDate),
      })
    } else if (isOpen && !entry) {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      form.reset({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        taskId: '' as any,
        comment: '',
        startDate: getLocalDateString(oneHourAgo),
        startTime: getLocalTimeString(oneHourAgo),
        endDate: getLocalDateString(now),
        endTime: getLocalTimeString(now),
      })
    }
  }, [entry, form, isOpen])

  async function onSubmit(data: EntryFormValues) {
    if (checkRateLimit()) return

    try {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`)
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`)

      const payload = {
        taskId: data.taskId,
        comment: data.comment,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
      }
      if (entry && entry.id) {
        await updateTimeEntry({ id: entry.id, ...payload })
        toast.success('Time entry updated', {
          description: `Entry #${entry.id} has been successfully updated.`,
        })
      } else {
        const newEntry = await createTimeEntry(payload)
        toast.success('Time entry created', {
          description: `New Entry #${newEntry.id} has been successfully created.`,
        })
      }
      setIsOpen(false)
      form.reset()
      router.refresh()
    } catch (error) {
      console.error('Failed to submit entry', error)
      let errorMsg = 'Unknown error'
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message)
          errorMsg = parsed.error || error.message
        } catch {
          errorMsg = error.message
        }
      }
      if (errorMsg.includes('Too many requests')) {
        reportRateLimit()
      }
      toast.error(`Failed to submit entry: ${errorMsg}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {entry ? `Edit Time Entry #${entry.id}` : 'Create Time Entry'}
          </DialogTitle>
          <DialogDescription>
            {entry
              ? 'Make changes to your time entry here.'
              : 'Add a new time entry to your log.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="taskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter Task ID"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Input placeholder="What did you work on?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time Section */}
            <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Date & Time</span>
                </div>
                {duration && duration !== 'Invalid' && (
                  <div className="flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-medium">{duration}</span>
                  </div>
                )}
              </div>

              {/* Start Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Start
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* End Section */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  End
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select time"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {entry ? 'Save Changes' : 'Create Entry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
