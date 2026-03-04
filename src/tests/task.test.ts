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

// Helper: register a user and return their token
const registerAndLogin = async (
  email = "taskuser@example.com",
  password = "password123",
) => {
  const res = await request(app)
    .post("/api/auth/register")
    .send({ name: "Task User", email, password });
  return res.body.token as string;
};

const validTask = {
  title: "Buy groceries",
  description: "Milk, eggs, bread",
  status: "pending",
};

describe("POST /api/tasks", () => {
  it("should create a task and return 201", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(validTask);

    expect(res.status).toBe(201);
    expect(res.body.title).toBe(validTask.title);
    expect(res.body.status).toBe("pending");
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app).post("/api/tasks").send(validTask);
    expect(res.status).toBe(401);
  });

  it("should return 400 if title is missing", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title here" });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/tasks", () => {
  it("should return an empty list initially", async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it("should return only tasks belonging to the authenticated user", async () => {
    const tokenA = await registerAndLogin("userA@example.com");
    const tokenB = await registerAndLogin("userB@example.com");

    // User A creates a task
    await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validTask);

    // User B should only see their own (none)
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks).toHaveLength(0);
  });
});

describe("GET /api/tasks/:id", () => {
  it("should return a task by ID", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(validTask);

    const taskId = created.body._id as string;
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body._id).toBe(taskId);
  });

  it("should return 403 if another user tries to access the task", async () => {
    const tokenA = await registerAndLogin("ownerA@example.com");
    const tokenB = await registerAndLogin("thiefB@example.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validTask);

    const taskId = created.body._id as string;
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/tasks/:id", () => {
  it("should update a task", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(validTask);

    const taskId = created.body._id as string;
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
  });

  it("should return 403 if another user tries to update the task", async () => {
    const tokenA = await registerAndLogin("ownerA2@example.com");
    const tokenB = await registerAndLogin("thiefB2@example.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validTask);

    const taskId = created.body._id as string;
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ status: "done" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("should delete a task and return 204", async () => {
    const token = await registerAndLogin();
    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(validTask);

    const taskId = created.body._id as string;
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("should return 403 if another user tries to delete the task", async () => {
    const tokenA = await registerAndLogin("ownerA3@example.com");
    const tokenB = await registerAndLogin("thiefB3@example.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(validTask);

    const taskId = created.body._id as string;
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });
});
