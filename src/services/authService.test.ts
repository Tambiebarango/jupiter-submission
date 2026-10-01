import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { redisClient } from "./redisClient.ts";
import { login, signup } from "./authService.ts";

vi.mock("./redisClient.ts", () => ({
  redisClient: {
    hSetNX: vi.fn(),
    hGetAll: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("signup", () => {
  test("raises error if username is missing", async () => {
    await expect(signup("", "password")).rejects.toThrowError(
      new Error("Username and password are required."),
    );
  });

  test("raises error if password is missing", async () => {
    await expect(signup("username", "")).rejects.toThrowError(
      new Error("Username and password are required."),
    );
  });

  test("raises error if password is not complex enough", async () => {
    await expect(signup("username", "password")).rejects.toThrowError(
      new Error(
        "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, and number.",
      ),
    );
  });

  test("raises error if username has been taken", async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password");
    vi.mocked(redisClient.hSetNX).mockResolvedValue(0);

    await expect(signup("username", "Password123")).rejects.toThrowError(
      new Error("Username is already taken"),
    );
    expect(redisClient.hSetNX).toHaveBeenCalledOnce();
  });

  test("saves the username and password when it meets all requirements", async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue("hashed-password");
    vi.mocked(redisClient.hSetNX).mockResolvedValue(1);

    await expect(signup("new-user", "StrongPass1")).resolves.toBe(true);
    expect(redisClient.hSetNX).toHaveBeenCalledOnce();
    expect(redisClient.hSetNX).toHaveBeenCalledWith(
      "new-user",
      "password",
      "hashed-password",
    );
  });
});

describe("login", () => {
  test("raises error if username is missing", async () => {
    await expect(login("", "password")).rejects.toThrowError(
      new Error("Invalid username or password"),
    );
  });

  test("raises error if password is missing", async () => {
    await expect(login("username", "")).rejects.toThrowError(
      new Error("Invalid username or password"),
    );
  });

  test("raises error if password is invalid", async () => {
    vi.mocked(redisClient.hGetAll).mockResolvedValue({
      password: "StrongPass1",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(false);

    await expect(login("username", "password")).rejects.toThrowError(
      new Error("Invalid username or password"),
    );
  });

  test("it returns jwt token if password is valid", async () => {
    vi.mocked(redisClient.hGetAll).mockResolvedValue({
      password: "StrongPass1",
    });
    vi.mocked(bcrypt.compare).mockResolvedValue(true);
    vi.mocked(jwt.sign).mockReturnValue("accessToken");

    await expect(login("username", "StrongPass1")).resolves.toBe("accessToken");
    expect(jwt.sign).toHaveBeenCalledWith(
      { username: "username" },
      expect.any(String),
      { expiresIn: "1h" },
    );
  });
});
