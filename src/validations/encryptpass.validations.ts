import bcrypt from 'bcryptjs'
export const encryptPassword = async (password: string) => {
   const salt = await bcrypt.genSalt(10);
   return await bcrypt.hash(password, salt);
}
export const comparePasswords = async (password: string, receivedPassword: string) => {
   return await bcrypt.compare(password, receivedPassword);
}
