import { cn } from '@/lib/utils.js'

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-slate-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
