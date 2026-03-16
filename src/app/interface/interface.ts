export interface user {
  userName: string,
  password: string,
  fullName: string,
  email: string,
  phone: number,
  unitNumber: string,
  token?: string
}

export interface loginInfo {
  userName: string,
  password: string
}

export interface getUserResponse {
  userId: number,
  userName: string,
  fullName: string,
  email: string,
  unitNumber: string
}

export interface res {
  message: string,
  data: any,
  status: number
}

export interface loginToken {
  accessToken: string
}
