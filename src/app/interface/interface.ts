interface user {
  userName: string,
  password: string,
  fullName: string,
  email: string,
  phone: number,
  unitNumber: string,
  token?: string
}

interface loginInfo {
  userName: string,
  password: string
}

interface getUserResponse {
  userId: number,
  userName: string,
  fullName: string,
  email: string,
  unitNumber: string
}

interface res {
  message: string,
  data: any,
  status: number
}

interface loginToken {
  accessToken: string
}
