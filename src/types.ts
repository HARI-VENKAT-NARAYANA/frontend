export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE'
export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type LeaveType = 'ANNUAL' | 'SICK' | 'PERSONAL' | 'MATERNITY' | 'UNPAID'
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID'
export type OnboardingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type EventType = 'LEAVE' | 'HOLIDAY' | 'ONBOARDING' | 'COMPANY_EVENT'
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt?: string
  updatedAt?: string
}

export interface Employee {
  _id: string
  user: User | string
  employeeCode: string
  department: string
  designation: string
  joiningDate: string
  phone: string
  address: string
  salary: number
  employmentStatus: EmploymentStatus
}

export interface Attendance {
  _id: string
  employee: Employee | string
  attendanceDate: string
  checkIn?: string
  checkOut?: string
  status: AttendanceStatus
}

export interface Leave {
  _id: string
  employee: Employee | string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  reviewComment?: string
  reviewedBy?: User | string
  createdAt: string
}

export interface Payroll {
  _id: string
  employee: Employee | string
  month: number
  year: number
  basicSalary: number
  allowances: number
  deductions: number
  netSalary: number
  paymentStatus: PaymentStatus
}

export interface Onboarding {
  _id: string
  employee: Employee | string
  joiningDate: string
  department: string
  designation: string
  status: OnboardingStatus
}

export interface OfferLetter {
  _id: string
  employee: Employee | string
  position: string
  department: string
  salary: number
  joiningDate: string
  employmentType: EmploymentType
  status: 'DRAFT' | 'SENT' | 'ACCEPTED'
}

export interface CalendarEvent {
  _id: string
  title: string
  description?: string
  eventType: EventType
  startDate: string
  endDate: string
  createdBy?: User | string
}

export interface Activity {
  id: string
  label: string
  category: string
  timestamp: string
}

export interface AdminDashboardData {
  metrics: { totalEmployees: number; presentToday: number; pendingLeaves: number; monthlyPayroll: number; processedPayroll: number; activeOnboarding: number }
  workforceTrend: { label: string; value: number }[]
  attendanceTrend: { label: string; value: number }[]
  leaveStats: { label: string; value: number }[]
  activities: Activity[]
}

export interface HrDashboardData {
  metrics: { employees: number; pendingLeaves: number; onboarding: number; attendance: number }
  workforceTrend: { label: string; value: number }[]
  activities: Activity[]
}

export interface EmployeeDashboardData {
  attendanceToday: Attendance | null
  leaveBalance: number
  recentLeaves: Leave[]
  latestPayslip: Payroll | null
  upcomingEvents: CalendarEvent[]
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}
