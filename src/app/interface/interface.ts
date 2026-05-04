import { BillStatus, BillType, NotificationType, PackageStatus, RepairStatus, ReservationStatus, UserRole, UserStatus, VisitorStatus } from "./enum"

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

export interface AnnouncementPayload {
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  expiresAt: string | null;
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
  facilityId: number,
  name: string,
  description: string,
  capacity: number,
  openTime: string,
  closeTime: string,
  isReservable: boolean,
  isAvailable: boolean,

  [key: string]: any;
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
  repairId: number,
  userName: string,
  location: string,
  category: string,
  description: string,
  status: RepairStatus,
  imageUrl: string,
  handlerName: string,
  submittedAt: string,
  resolvedAt: string,
  note?: string
}

export interface Reservation {
  reservationId: number,
  userId: number,
  unitNumber?: string,
  facilityId: number,
  date: string,
  startTime: string,
  endTime: string,
  attendees: number,
  isAvailable?: boolean,
  status?: ReservationStatus,
  createdAt?: string
}

export interface ResReservation {
  reservationId: number,
  userName: string,
  facilityName: string,
  date: string,
  startTime: string,
  endTime: string,
  attendees: number,
  status: ReservationStatus
}

export interface User {
  userId?: number,
  userName: string,
  passwordHash?: string,
  fullName: string,
  email: string,
  phone: string,
  unitNumber: string,
  role?: UserRole,
  status?: UserStatus,
  createdAt?: string
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
  role: UserRole,
  userName: string,
  fullName: string,
  email: string,
  phone: string,
  unitNumber: string,
  squareFootage: number,
  motorParkingSpace: number,
  carParkingSpace: number,
  status: UserStatus,
}

export interface Res {
  message: string,
  data: any,
  status: number
}

export interface LoginToken {
  accessToken: string
}

export interface Holiday {
  id: number;
  date: string; // yyyy-MM-dd
  title: string;
}

export interface DayCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  holiday?: Holiday;
  events: Holiday[];
  reservations: Holiday[];
  bills: Holiday[];
}
