import * as React from 'react'
import { cn } from '../../lib/utils'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      'flex min-h-24 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    ref={ref}
    {...props}
  />
))

Textarea.displayName = 'Textarea'
