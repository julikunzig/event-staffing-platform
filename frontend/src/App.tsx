import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import EventsPage from '@/pages/EventsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import JobRolesPage from '@/pages/JobRolesPage'
import EventCreatePage from '@/pages/EventCreatePage'
import UsersPage from '@/pages/UsersPage'
import ReportsPage from '@/pages/ReportsPage'
import CompaniesPage from '@/pages/CompaniesPage'
import CompanySettingsPage from '@/pages/CompanySettingsPage'
import ChangePasswordPage from '@/pages/ChangePasswordPage'
import EmployeeProfilePage from '@/pages/EmployeeProfilePage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import AccountPage from '@/pages/AccountPage'
import EventEditPage from '@/pages/EventEditPage'
import NewsPage from '@/pages/NewsPage'
import EventHoursPage from '@/pages/EventHoursPage'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
            <Route path="/events/new" element={<ProtectedRoute roles={['admin', 'super_admin']}><EventCreatePage /></ProtectedRoute>} />
            <Route path="/events/:id/edit" element={<ProtectedRoute roles={['admin', 'super_admin']}><EventEditPage /></ProtectedRoute>} />
            <Route path="/events/:id" element={<ProtectedRoute><EventDetailPage /></ProtectedRoute>} />
            <Route path="/job-roles" element={<ProtectedRoute roles={['admin', 'super_admin']}><JobRolesPage /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute roles={['admin', 'super_admin']}><UsersPage /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute roles={['super_admin']}><CompaniesPage /></ProtectedRoute>} />
            <Route path="/company-settings" element={<ProtectedRoute roles={['admin', 'super_admin']}><CompanySettingsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><EmployeeProfilePage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute roles={['admin', 'super_admin', 'coordinator', 'employee']}><ReportsPage /></ProtectedRoute>} />
            <Route path="/news" element={<ProtectedRoute><NewsPage /></ProtectedRoute>} />
            <Route path="/event-hours" element={<ProtectedRoute roles={['admin', 'super_admin', 'coordinator']}><EventHoursPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
