import bcrypt from "bcrypt";

interface User {
  [username: string]: string
}

let users: User = {};

export async function signup(username:string, password:string) {
  if (!username || !password) {
    throw new Error('Username and password are required.')
  }

  if (Object.hasOwn(users, username)) {
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

  users[username] = await bcrypt.hash(password, 12);
}

export async function login(username: string, password: string) {
  const passwordHash = users[username];

  if (!passwordHash) {
    throw new Error('Invalid username or password');
  }

  const passwordIsValid = await bcrypt.compare(password, passwordHash);

  if (!passwordIsValid) {
    throw new Error('Invalid username or password');
  }
}