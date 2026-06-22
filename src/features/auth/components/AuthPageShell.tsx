import type { ReactNode } from 'react'

type AuthPageShellProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export const AuthPageShell = ({ title, description, children, footer }: AuthPageShellProps) => (
  <div className="flex min-h-screen items-center justify-center bg-surface-warm px-6 py-12 text-right">
    <div className="w-full max-w-md animate-fade-in">
      <div className="mb-8">
        <h1 className="mb-1.5 text-3xl font-black tracking-tight text-slate-900">{title}</h1>
        {description && <p className="text-sm leading-relaxed text-slate-500">{description}</p>}
      </div>
      {children}
      {footer}
    </div>
  </div>
)
