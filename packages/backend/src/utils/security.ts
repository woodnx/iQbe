import bcrypt from 'bcrypt';

export const generateHashedPassword = (passwd: string) => (
  bcrypt.hashSync(passwd, 10)
);

export const checkPassword = (plainPassword: string, hashedPassword: string) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}