import { cn } from '@/lib/utils.js'

export function Badge({ className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[#2A2A35] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#A1A1AA]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
