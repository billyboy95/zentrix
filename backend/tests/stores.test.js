const request = require("supertest");
const app = require("../src/app");

async function startStore(overrides = {}) {
  const res = await request(app)
    .post("/api/stores")
    .send({
      name: overrides.name || "Cape Town Shop",
      templateId: overrides.templateId || "shrine",
      notes: overrides.notes,
    });
  return res;
}

describe("Stores API", () => {
  it("GET /api/stores returns an empty list initially", async () => {
    const res = await request(app).get("/api/stores");
    expect(res.status).toBe(200);
    expect(res.body.stores).toEqual([]);
  });

  it("POST /api/stores without name returns 400", async () => {
    const res = await request(app).post("/api/stores").send({ templateId: "shrine" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/name/i);
  });

  it("POST /api/stores without templateId returns 400", async () => {
    const res = await request(app).post("/api/stores").send({ name: "No Theme" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/templateId/i);
  });

  it("POST /api/stores with unknown templateId returns 400", async () => {
    const res = await request(app)
      .post("/api/stores")
      .send({ name: "Bad Theme", templateId: "dawn" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/shrine or olivia/i);
  });

  it("Start creates a shrine store draft", async () => {
    const res = await startStore({ name: "Shrine Draft" });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Shrine Draft");
    expect(res.body.templateId).toBe("shrine");
    expect(res.body.templateName).toBe("Shrine");
    expect(res.body.status).toBe("draft");
    expect(res.body.themePackage).toBeNull();
  });

  it("Start creates an olivia store draft", async () => {
    const res = await startStore({ name: "Olivia Draft", templateId: "olivia" });
    expect(res.status).toBe(201);
    expect(res.body.templateId).toBe("olivia");
    expect(res.body.templateName).toBe("Olivia");
    expect(res.body.status).toBe("draft");
  });

  it("GET /api/stores lists created stores and filters by status", async () => {
    const list = await request(app).get("/api/stores");
    expect(list.status).toBe(200);
    expect(list.body.stores.length).toBeGreaterThanOrEqual(2);

    const drafts = await request(app).get("/api/stores?status=draft");
    expect(drafts.status).toBe(200);
    expect(drafts.body.stores.every((s) => s.status === "draft")).toBe(true);
    expect(drafts.body.stores.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /api/stores/:id returns a store and 404s for missing ids", async () => {
    const created = await startStore({ name: "Lookup Store" });
    const found = await request(app).get(`/api/stores/${created.body.id}`);
    expect(found.status).toBe(200);
    expect(found.body.name).toBe("Lookup Store");

    const missing = await request(app).get("/api/stores/does-not-exist");
    expect(missing.status).toBe(404);
  });

  it("PUT /api/stores/:id updates name and notes", async () => {
    const created = await startStore({ name: "Before Update" });
    const res = await request(app)
      .put(`/api/stores/${created.body.id}`)
      .send({ name: "After Update", notes: "Reviewed" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("After Update");
    expect(res.body.notes).toBe("Reviewed");
  });

  it("submit moves draft to pending_approval", async () => {
    const created = await startStore({ name: "Submit Me" });
    const res = await request(app).post(`/api/stores/${created.body.id}/submit`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending_approval");
  });

  it("Approve moves draft to approved", async () => {
    const created = await startStore({ name: "Approve Draft" });
    const res = await request(app).post(`/api/stores/${created.body.id}/approve`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  it("Approve moves pending_approval to approved", async () => {
    const created = await startStore({ name: "Approve Pending" });
    await request(app).post(`/api/stores/${created.body.id}/submit`);
    const res = await request(app).post(`/api/stores/${created.body.id}/approve`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("approved");
  });

  it("Reject moves draft to rejected", async () => {
    const created = await startStore({ name: "Reject Me" });
    const res = await request(app).post(`/api/stores/${created.body.id}/reject`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("rejected");
  });

  it("Add/Provision marks approved → live and records the theme package path", async () => {
    const created = await startStore({ name: "Go Live", templateId: "olivia" });
    await request(app).post(`/api/stores/${created.body.id}/approve`);
    const res = await request(app).post(`/api/stores/${created.body.id}/provision`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("live");
    expect(res.body.themePackage).toBe("themes/packages/olivia-14.2.5.zip");
  });

  it("cannot approve a live store", async () => {
    const created = await startStore({ name: "Already Live" });
    await request(app).post(`/api/stores/${created.body.id}/approve`);
    await request(app).post(`/api/stores/${created.body.id}/provision`);
    const res = await request(app).post(`/api/stores/${created.body.id}/approve`);
    expect(res.status).toBe(400);
  });

  it("cannot provision a draft store", async () => {
    const created = await startStore({ name: "Too Early" });
    const res = await request(app).post(`/api/stores/${created.body.id}/provision`);
    expect(res.status).toBe(400);
  });

  it("DELETE /api/stores/:id removes the store", async () => {
    const created = await startStore({ name: "Delete Me" });
    const res = await request(app).delete(`/api/stores/${created.body.id}`);
    expect(res.status).toBe(204);
    const lookup = await request(app).get(`/api/stores/${created.body.id}`);
    expect(lookup.status).toBe(404);
  });

  it("action endpoints 404 for missing stores", async () => {
    const approve = await request(app).post("/api/stores/missing/approve");
    expect(approve.status).toBe(404);
    const provision = await request(app).post("/api/stores/missing/provision");
    expect(provision.status).toBe(404);
  });
});
