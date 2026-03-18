export interface User {
  userName: string,
  password: string,
  fullName: string,
  email: string,
  phone: number,
  unitNumber: string,
  token?: string
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

export interface Facility {
  id: number,
  name: string,
  description: string,
  capacity: number,
  open_time: string,
  close_time: string,
  is_available: boolean
}

export interface RepairRequest {
  id: number,
  location: string,
  category: string,
  description: string,
  status: '待處理' | '處理中' | '已完工',
  submittedAt: string,
  resolvedAt: string,
  handler: string,
  note: string
}

export interface Bill {
  id: number,
  billingMonth: string,
  billType: '水費' | '電費' | '管理費',
  amount: number,
  dueDate: string,
  status: '待繳' | '已繳' | '逾期',
  paidAt: string
}

export interface Visitor {
  id: number,
  name: string,
  phone: string,
  hostUnit: string,
  licensePlate: string,
  checkInTime: string,
  checkOutTime: string,
  status: '在內' | '已離'
}
