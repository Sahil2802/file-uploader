import request from "supertest";
import { createApp } from "../app.js";
import { connect, clearDatabase, closeDatabase } from "./helpers/db.js";

const app = createApp();

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

// Test data
const validUser = {
  name: "Test User",
  email: "test@example.com",
  password: "password123",
};

describe("POST /api/auth/register", () => {
  it("should register a new user and return 201 with a token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.name).toBe(validUser.name);
    // Password must never be returned
    expect(res.body.user.password).toBeUndefined();
  });

  it("should return 409 if email is already registered", async () => {
    await request(app).post("/api/auth/register").send(validUser);

    const res = await request(app)
      .post("/api/auth/register")
      .send(validUser);

    expect(res.status).toBe(409);
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@example.com" }); // missing name & password

    expect(res.status).toBe(400);
  });

  it("should return 400 if password is too short", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ ...validUser, password: "short" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    // Register a user before each login test
    await request(app).post("/api/auth/register").send(validUser);
  });

  it("should login successfully and return a token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should return 401 for wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(401);
  });

  it("should return 401 for unregistered email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("should return 400 if email is invalid format", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email", password: "password123" });

    expect(res.status).toBe(400);
  });
});
