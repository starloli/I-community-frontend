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
