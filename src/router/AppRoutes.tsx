import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { AUTH_EXPIRED_EVENT } from '../api/client'
import { useAuthStore } from '../store/auth.store'
import { selectIsAuthenticated } from '../store/auth.selectors'
import type { UserRole } from '@/types'
import { Login } from '../features/auth'
import { AnnualReportDetail, AnnualReportsPage } from '../features/annualReports'
import { AdvancePayments } from '../features/advancedPayments'
import { Binders } from '../features/binders'
import { Charges } from '../features/charges'
import { ClientDetails, Clients } from '../features/clients'
import { BusinessDetails } from '../features/businesses'
import { DashboardPage } from '../features/dashboard'
import { Navbar } from '../components/layout/Navbar'
import { Sidebar } from '../components/layout/Sidebar/Sidebar'
import { PageLayout } from '../components/layout/PageLayout'
import { WorkQueuePage } from '../features/workQueue'
import { TasksPage } from '../features/tasks'
import { Search } from '../features/search'
import { SigningPage } from '../features/signing'
import { TaxCalendarGroupsPage } from '../features/taxCalendar'
import { TaxCalendarSettingsPage } from '../features/taxCalendarSettings'
import { TaxDashboardPage } from '../features/taxDashboard'
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

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" replace />

  return <Outlet />
}

const AuthenticatedLayout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const toggleSidebar = () => setSidebarOpen((prev) => !prev)

  return (
    <div className="flex flex-1 overflow-hidden h-screen">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar toggleSidebar={toggleSidebar} />
        <PageLayout>
          <Outlet />
        </PageLayout>
      </div>
    </div>
  )
}

export const AppRoutes: React.FC = () => {
  return (
    <>
      <AuthExpiredNavigationHandler />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="binders" element={<Binders />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId" element={<ClientDetails />} />
            <Route path="clients/:clientId/documents" element={<ClientDetails initialTab="documents" />} />
            <Route path="clients/:clientId/timeline" element={<ClientDetails initialTab="timeline" />} />
            <Route path="clients/:clientId/vat" element={<ClientDetails initialTab="vat" />} />
            <Route
              path="clients/:clientId/advance-payments"
              element={<ClientDetails initialTab="advance-payments" />}
            />
            <Route path="clients/:clientId/annual-reports" element={<ClientDetails initialTab="annual-reports" />} />
            <Route path="clients/:clientId/communication" element={<ClientDetails initialTab="communication" />} />
            <Route path="clients/:clientId/history" element={<ClientDetails initialTab="history" />} />
            <Route path="clients/:clientId/businesses/:businessId" element={<BusinessDetails />} />
            <Route path="search" element={<Search />} />
            <Route path="charges" element={<Charges />} />
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
            <Route path="reminders" element={<Navigate to="/" replace />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="work-queue" element={<WorkQueuePage />} />
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
