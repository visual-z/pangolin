export function generateRandomPassword(length: number) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * chars.length);
    const char = chars[index];
    password += char;
  }
  return password;
}
