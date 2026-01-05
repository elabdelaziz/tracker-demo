'use client'

import * as React from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TimePickerProps {
  value?: string // HH:MM format (24h)
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Pick time',
  disabled,
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)

  // Parse current value from 24h to 12h
  const parsedTime = React.useMemo(() => {
    if (!value) return { hour: '', minute: '', period: 'AM' }
    const [h, m] = value.split(':').map(Number)
    let period = 'AM'
    let hour = h

    if (hour >= 12) {
      period = 'PM'
      if (hour > 12) hour -= 12
    }
    if (hour === 0) hour = 12

    return {
      hour: String(hour).padStart(2, '0'),
      minute: String(m).padStart(2, '0'),
      period,
    }
  }, [value])

  const [hour, setHour] = React.useState(parsedTime.hour)
  const [minute, setMinute] = React.useState(parsedTime.minute)
  const [period, setPeriod] = React.useState(parsedTime.period)

  // Update local state when value changes (e.g. initial load or external update)
  React.useEffect(() => {
    setHour(parsedTime.hour)
    setMinute(parsedTime.minute)
    setPeriod(parsedTime.period)
  }, [parsedTime])

  const updateTime = (
    newHour: string,
    newMinute: string,
    newPeriod: string
  ) => {
    if (!newHour || !newMinute) return

    let h = parseInt(newHour)
    if (newPeriod === 'PM' && h < 12) h += 12
    if (newPeriod === 'AM' && h === 12) h = 0

    const timeString = `${String(h).padStart(2, '0')}:${newMinute}`
    onChange?.(timeString)
  }

  const handleHourChange = (val: string) => {
    setHour(val)
    if (minute) updateTime(val, minute, period)
  }

  const handleMinuteChange = (val: string) => {
    setMinute(val)
    if (hour) updateTime(hour, val, period)
  }

  const handlePeriodChange = (val: string) => {
    setPeriod(val)
    if (hour && minute) updateTime(hour, minute, val)
  }

  // Format display time
  const displayTime = value
    ? `${parsedTime.hour}:${parsedTime.minute} ${parsedTime.period}`
    : null

  // Generate hours (01-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  )

  // Generate minutes (00, 05, 10, ..., 55) plus current minute if not in list
  const minuteOptions = React.useMemo(() => {
    const baseOptions = Array.from({ length: 12 }, (_, i) =>
      String(i * 5).padStart(2, '0')
    )
    if (minute && !baseOptions.includes(minute)) {
      return [...baseOptions, minute].sort((a, b) => Number(a) - Number(b))
    }
    return baseOptions
  }, [minute])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            'w-full justify-start text-left font-normal h-9',
            !displayTime && 'text-muted-foreground',
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4 shrink-0" />
          {displayTime || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Hour</label>
            <Select value={hour} onValueChange={handleHourChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="HH" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {hourOptions.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xl font-semibold mt-5">:</span>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Minute</label>
            <Select value={minute} onValueChange={handleMinuteChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {minuteOptions.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <label className="text-xs text-muted-foreground">AM/PM</label>
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
