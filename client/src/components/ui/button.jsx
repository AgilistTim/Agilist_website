import { forwardRef } from 'react'
import { cn } from '@/lib/utils.js'

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  default: 'bg-cyan-400 text-slate-900 hover:bg-cyan-500',
  outline: 'border border-slate-600 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-400/10',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  ghost: 'hover:bg-slate-800 hover:text-white'
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
