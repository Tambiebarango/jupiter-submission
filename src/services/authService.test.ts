import { beforeEach, describe, expect, test, vi } from "vitest";
import { login, signup } from "./authService.ts";

const mocks = vi.hoisted(() => ({
  hSetNX: vi.fn<
    (key: string, field: string, value: string) => Promise<number>
  >(),
  hGetAll: vi.fn<(key: string) => Promise<Record<string, string>>>(),
  hash: vi.fn<
    (data: string | Buffer, saltOrRounds: string | number) => Promise<string>
  >(),
  compare: vi.fn<
    (data: string | Buffer, encrypted: string) => Promise<boolean>
  >(),
  sign: vi.fn<
    (
      payload: object,
      secret: string,
      options: { expiresIn: string },
    ) => string
  >(),
}));

vi.mock("./redisClient.ts", () => ({
  redisClient: {
    hSetNX: mocks.hSetNX,
    hGetAll: mocks.hGetAll,
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: mocks.hash,
    compare: mocks.compare,
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: mocks.sign,
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
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.hSetNX.mockResolvedValue(0);

    await expect(signup("username", "Password123")).rejects.toThrowError(
      new Error("Username is already taken"),
    );
    expect(mocks.hSetNX).toHaveBeenCalledOnce();
  });

  test("saves the username and password when it meets all requirements", async () => {
    mocks.hash.mockResolvedValue("hashed-password");
    mocks.hSetNX.mockResolvedValue(1);

    await expect(signup("new-user", "StrongPass1")).resolves.toBe(true);
    expect(mocks.hSetNX).toHaveBeenCalledOnce();
    expect(mocks.hSetNX).toHaveBeenCalledWith(
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
    mocks.hGetAll.mockResolvedValue({
      password: "StrongPass1",
    });
    mocks.compare.mockResolvedValue(false);

    await expect(login("username", "password")).rejects.toThrowError(
      new Error("Invalid username or password"),
    );
  });

  test("it returns jwt token if password is valid", async () => {
    mocks.hGetAll.mockResolvedValue({
      password: "StrongPass1",
    });
    mocks.compare.mockResolvedValue(true);
    mocks.sign.mockReturnValue("accessToken");

    await expect(login("username", "StrongPass1")).resolves.toBe("accessToken");
    expect(mocks.sign).toHaveBeenCalledWith(
      { username: "username" },
      expect.any(String),
      { expiresIn: "1h" },
    );
  });
});
