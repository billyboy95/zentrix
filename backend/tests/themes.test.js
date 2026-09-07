const request = require("supertest");
const app = require("../src/app");

describe("Themes API", () => {
  it("GET /api/themes lists shrine and olivia from the real catalog", async () => {
    const res = await request(app).get("/api/themes");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.themes)).toBe(true);
    expect(res.body.flow).toMatchObject({
      start: expect.any(String),
      approve: expect.any(String),
      add: expect.any(String),
    });

    const ids = res.body.themes.map((t) => t.id);
    expect(ids).toEqual(expect.arrayContaining(["shrine", "olivia"]));

    const shrine = res.body.themes.find((t) => t.id === "shrine");
    expect(shrine.name).toBe("Shrine");
    expect(shrine.version).toBe("1.3.1");
    expect(shrine.author).toBe("Shrine");
    expect(shrine.role).toBe("starter");
    expect(shrine.package).toBe("themes/packages/shrine-1.3.1.zip");
    expect(shrine.available).toBe(true);

    const olivia = res.body.themes.find((t) => t.id === "olivia");
    expect(olivia.name).toBe("Olivia");
    expect(olivia.version).toBe("14.2.5");
    expect(olivia.author).toBe("LuminTheme");
    expect(olivia.vendor).toBe("LuminTheme");
    expect(olivia.role).toBe("conversion");
    expect(olivia.package).toBe("themes/packages/olivia-14.2.5.zip");
    expect(olivia.available).toBe(true);
  });
});
