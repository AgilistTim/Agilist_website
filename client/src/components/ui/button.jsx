import { forwardRef } from 'react'
import { cn } from '@/lib/utils.js'

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#7C3AED] focus-visible:ring-offset-[#0D0D0F] disabled:pointer-events-none disabled:opacity-50'

const variants = {
  default: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]',
  outline: 'border border-[#7C3AED] text-[#F4F4F5] hover:border-[#A78BFA] hover:bg-[#7C3AED]/10',
  secondary: 'bg-[#16161A] text-white hover:bg-[#1F1F24]',
  ghost: 'hover:bg-[#16161A] hover:text-white',
  link: 'bg-transparent text-[#A78BFA] hover:text-white underline underline-offset-4'
}

const sizes = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-11 px-6 text-lg',
  icon: 'h-10 w-10'
}

export const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'default', href, target, rel, type, ...props },
  ref
) {
  const Component = href ? 'a' : 'button'

  const commonClasses = cn(
    baseStyles,
    variants[variant] ?? variants.default,
    sizes[size] ?? sizes.default,
    className
  )

  const componentProps = {
    ref,
    className: commonClasses,
    ...props
  }

  if (href) {
    componentProps.href = href
    if (target) componentProps.target = target
    if (rel) componentProps.rel = rel
  } else {
    componentProps.type = type ?? 'button'
  }

  return <Component {...componentProps} />
})
