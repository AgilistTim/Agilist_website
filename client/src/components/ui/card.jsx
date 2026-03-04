import { forwardRef } from 'react'
import { cn } from '@/lib/utils.js'

export const Card = forwardRef(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('rounded-xl border border-[#2A2A35] bg-[#16161A] text-[#F4F4F5] shadow-sm', className)}
      {...props}
    />
  )
})

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
)

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-[#A1A1AA]', className)} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
)

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
)
