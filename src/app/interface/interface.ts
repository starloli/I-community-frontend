import { BillStatus, BillType, NotificationType, PackageStatus, RepairStatus, ReservationStatus, UserRole, VisitorStatus } from "./enum"

export interface Announcement {
  announcementId?: number,
  title: string,
  content: string,
  category: string,
  author: User,
  isPinned: boolean,
  publishedAt: string,
  expiresAt: string
}

export interface Bill {
  id?: number,
  user?: User,
  billType: BillType,
  amount: number,
  billingMonth: string,
  dueDate: string,
  status: BillStatus,
  paidAt: string,
  paymentMethod: string,
  createdAt: string
}

export interface Facility {
  id?: number,
  name: string,
  description: string,
  capacity: number,
  openTime: string,
  closeTime: string,
  isAvailable: boolean
}

export interface Notification {
  id?: number,
  user: User,
  NotificationType: NotificationType,
  message: string,
  isRead: boolean,
  createdAt: string,
}

export interface Package {
  id?: number,
  user: User,
  trackingNumber: string,
  courier: string,
  arrivedAt: string,
  pickupAt: string,
  status: PackageStatus,
  notes: string,
  unitNumber: string,
  isNotified: boolean
}

export interface RepairRequest {
  id?: number,
  user: User,
  location: string,
  category: string,
  description: string,
  status: RepairStatus,
  imageUrl: string,
  handler: User,
  submittedAt: string,
  resolvedAt: string,
  note?:string
}

export interface Reservation {
  id?: number,
  user?: User,
  facility: Facility,
  date: string,
  startTime: string,
  endTime: string,
  attendees: number,
  status: ReservationStatus,
  createdAt: string
}

export interface User {
  userId?: number,
  userName: string,
  passwordHash: string,
  fullName: string,
  email: string,
  phone: string,
  unitNumber: string,
  role: UserRole,
  isActive: boolean,
  createdAt: string,
  token?: string
}

export interface ResidentOption {
  userId: number,
  fullName: string
}

export interface Visitor {
  id: number,
  visitorName: string,
  visitorPhone: string,
  licensePlate: string,
  hostUser: User,
  purpose: string,
  checkInTime: string,
  checkOutTime: string,
  status: VisitorStatus
}

export interface VisitorRecord {
  visitorId: number,
  visitorName: string,
  visitorPhone?: string,
  licensePlate?: string,
  residentialAddress?: string,
  purpose?: string,
  estimatedTime?: string,
  checkInTime?: string,
  checkOutTime?: string,
  status: string,
  formattedEstimated?: string,
  displayAddress?: string
}

export interface LoginInfo {
  userName: string,
  password: string
}

export interface UserResponse {
  userId: number,
  userName: string,
  fullName: string,
  email: string,
  unitNumber: string
}

export interface Res {
  message: string,
  data: any,
  status: number
}

export interface LoginToken {
  accessToken: string
}
