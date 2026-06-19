import { useCallback, useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AUTH_EXPIRED_EVENT } from '../api/client'
import { useAuthStore } from '../store/auth.store'
import { selectIsAuthenticated } from '../store/auth.selectors'
import type { UserRole } from '@/types'
import { ForgotPassword, Login, ResetPassword } from '../features/auth'
import { AnnualReportDetail, AnnualReportsPage } from '../features/annualReports'
import { AdvancePayments } from '../features/advancedPayments'
import { Binders } from '../features/binders'
import { Charges } from '../features/charges'
import { ClientDetails, Clients } from '../features/clients'
import { BusinessDetails } from '../features/businesses'
import { DashboardPage } from '../features/dashboard'
import { Navbar } from '../components/layout/Navbar/Navbar'
import { ClientSidebar } from '../components/layout/ClientSidebar/ClientSidebar'
import { PageLayout } from '../components/layout/PageLayout'
import { NotificationsPage } from '../features/notifications'
import { WorkQueuePage } from '../features/workQueue'
import { Search } from '../features/search'
import { SigningPage } from '../features/signing'
import { TaxCalendarGroupsPage } from '../features/taxCalendar'
import { TaxCalendarSettingsPage } from '../features/taxCalendarSettings'
import { TaxDashboardPage } from '../features/taxDashboard'
import { TasksPage } from '../features/tasks'
import { Users } from '../features/users'
import { VatWorkItemDetail, VatWorkItems } from '../features/vatReports'
import {
  AdvancePaymentReportView,
  AgingReportView,
  AnnualReportStatusView,
  VatComplianceReportView,
} from '../features/reports'

const AuthExpiredNavigationHandler: React.FC = () => {
  const navigate = useNavigate()
  const resetSession = useAuthStore((s) => s.resetSession)
  const navigateRef = useRef(navigate)

  useEffect(() => {
    navigateRef.current = navigate
  }, [navigate])

  useEffect(() => {
    const handleAuthExpired = () => {
      resetSession()
      if (!window.location.pathname.startsWith('/login')) {
        navigateRef.current('/login', { replace: true })
      }
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  }, [resetSession])

  return null
}

interface ProtectedRouteProps {
  requiredRole?: UserRole
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const user = useAuthStore((s) => s.user)
  const hasBootstrapped = useAuthStore((s) => s.hasBootstrapped)

  if (!hasBootstrapped) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">טוען...</div>
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />

  return <Outlet />
}

const AuthenticatedLayout: React.FC = () => {
  const [mobileClientSidebarOpen, setMobileClientSidebarOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebar-open')
      return stored === null ? true : stored === 'true'
    } catch {
      return true
    }
  })
  const mobileClientSidebarTriggerRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const openMobileClientSidebar = useCallback(() => setMobileClientSidebarOpen(true), [])
  const closeMobileClientSidebar = useCallback(() => setMobileClientSidebarOpen(false), [])
  const toggleDesktopSidebar = useCallback(() => {
    setDesktopSidebarOpen((open) => {
      const next = !open
      try { localStorage.setItem('sidebar-open', String(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  useEffect(() => {
    setMobileClientSidebarOpen(false)
  }, [location.pathname, location.search])

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden">
      <Navbar
        onOpenClientSidebar={openMobileClientSidebar}
        clientSidebarTriggerRef={mobileClientSidebarTriggerRef}
        sidebarOpen={desktopSidebarOpen}
        onToggleSidebar={toggleDesktopSidebar}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ClientSidebar
          mobileOpen={mobileClientSidebarOpen}
          onMobileClose={closeMobileClientSidebar}
          mobileTriggerRef={mobileClientSidebarTriggerRef}
          desktopOpen={desktopSidebarOpen}
        />
        <PageLayout>
          <Outlet />
        </PageLayout>
      </div>
    </div>
  )
}

export const AppRoutes: React.FC = () => {
  const bootstrap = useAuthStore((s) => s.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <>
      <AuthExpiredNavigationHandler />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="binders" element={<Binders />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId" element={<ClientDetails />} />
            <Route path="clients/:clientId/documents" element={<ClientDetails initialTab="documents" />} />
            <Route path="clients/:clientId/timeline" element={<ClientDetails initialTab="timeline" />} />
            <Route path="clients/:clientId/charges" element={<ClientDetails initialTab="charges" />} />
            <Route path="clients/:clientId/vat" element={<ClientDetails initialTab="vat" />} />
            <Route path="clients/:clientId/tax-calendar" element={<ClientDetails initialTab="tax-calendar" />} />
            <Route
              path="clients/:clientId/advance-payments"
              element={<ClientDetails initialTab="advance-payments" />}
            />
            <Route path="clients/:clientId/annual-reports" element={<ClientDetails initialTab="annual-reports" />} />
            <Route path="clients/:clientId/communication" element={<ClientDetails initialTab="communication" />} />
            <Route path="clients/:clientId/notifications" element={<ClientDetails initialTab="notifications" />} />
            <Route path="clients/:clientId/notes" element={<ClientDetails initialTab="notes" />} />
            <Route path="clients/:clientId/history" element={<ClientDetails initialTab="history" />} />
            <Route path="clients/:clientId/tasks" element={<ClientDetails initialTab="tasks" />} />
            <Route path="clients/:clientId/businesses/:businessId" element={<BusinessDetails />} />
            <Route path="search" element={<Search />} />
            <Route path="charges" element={<Charges />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="tax" element={<Navigate to="/tax/calendar" replace />} />
            <Route path="tax/dashboard" element={<TaxDashboardPage />} />
            <Route path="tax/reports" element={<AnnualReportsPage />} />
            <Route path="tax/reports/:reportId" element={<AnnualReportDetail />} />
            <Route path="tax/calendar" element={<TaxCalendarGroupsPage />} />
            <Route path="tax/advance-payments" element={<AdvancePayments />} />
            <Route path="tax/vat" element={<VatWorkItems />} />
            <Route path="tax/vat/:id" element={<VatWorkItemDetail />} />
            <Route path="tax/vat-compliance" element={<Navigate to="/reports/vat-compliance" replace />} />
            <Route path="reports/vat-compliance" element={<VatComplianceReportView />} />
            <Route path="reports/aging" element={<AgingReportView />} />
            <Route path="reports/annual-status" element={<AnnualReportStatusView />} />
            <Route path="reports/advance-payments" element={<AdvancePaymentReportView />} />
            <Route path="work-queue" element={<WorkQueuePage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Route>
        </Route>

        <Route path="/" element={<ProtectedRoute requiredRole="advisor" />}>
          <Route element={<AuthenticatedLayout />}>
            <Route path="settings/users" element={<Users />} />
            <Route path="settings/tax-calendar" element={<TaxCalendarSettingsPage />} />
          </Route>
        </Route>

        <Route path="/sign/:token" element={<SigningPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
