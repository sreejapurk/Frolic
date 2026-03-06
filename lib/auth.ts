export function isValidAdminPassword(password: string) {
    return password === process.env.ADMIN_PASSWORD
  }
  