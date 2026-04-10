export enum BillType {
  WATER = '水費',
  ELECTRICITY = '電費',
  MANAGEMENT = '管理費',
  MAINTENANCE = '維修費',
  OTHER = '其他'
}

export enum BillStatus {
  UNPAID = '待繳',
  PAID = '已繳',
  OVERDUE = '逾期'
}

export enum NotificationType {
  BILL = '帳單',
  PACKAGE = '包裹通知',
  REPAIR = '維修通知',
  ANNOUNCE = '公告'
}

export enum PackageStatus {
  WAITING = 'WAITING',
  PICKED_UP = 'PICKED_UP',
}

export enum RepairStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE"
}

export enum ReservationStatus {
  CONFIRMED = 'CONFIRMED',
  CONFIRMING = 'CONFIRMING',
  CANCELLED = 'CANCELLED'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  GUARD = 'GUARD',
  RESIDENT = 'RESIDENT'
}

export enum VisitorStatus {
  INSIDE = '在內',
  LEFT = '已離開'
}
