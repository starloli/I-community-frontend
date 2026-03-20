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
  WAITING = '待取貨',
  PICKED_UP = '已取貨',
}

export enum RepairStatus {
  PENDING = "待處理",
  IN_PROGRESS = "處理中",
  DONE = "已完成"
}

export enum ReservationStatus {
  CONFIRMED = '已確認',
  CANCELLED = '已取消'
}

export enum UserRole {
  ADMIN = '管理員',
  GUARD = '保全',
  RESIDENT = '住戶'
}

export enum VisitorStatus {
  INSIDE = '在內',
  LEFT = '已離開'
}
