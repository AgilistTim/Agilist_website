import { forwardRef } from 'react'
import { cn } from '@/lib/utils.js'

export const Input = forwardRef(function Input({ className, type = 'text', ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-[#2A2A35] bg-[#0D0D0F] px-3 py-2 text-sm text-white placeholder:text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0F] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
})
