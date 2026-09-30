import bcrypt from "bcrypt";
import { userRepository } from '../db/userRepository.ts';

export async function signup(username:string, password:string) {
  if (!username || !password) {
    throw new Error('Username and password are required.')
  }

  const existingUser = await userRepository
    .search()
    .where('username')
    .eq(username)
    .returnFirst();

  if (existingUser) {
    throw new Error('Username is already taken');
  }

  const passwordIsValid =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password);

  if (!passwordIsValid) {
    throw new Error(
        'Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number.'
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = { username: username, password: hashedPassword };

  await userRepository.save(user);
}

export async function login(username: string, password: string) {
  if (!username || !password) {
    throw new Error('Invalid username or password');
  }

  const user = await repository
    .search()
    .where('username')
    .eq(username)
    .returnFirst();

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    throw new Error('Invalid username or password');
  }
}