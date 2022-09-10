import  request from "supertest"
import { Connection } from "typeorm"
import { app } from "../../../../app"
import createConnection from "../../../../database"

let connection: Connection;

describe("Show User Profile Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to show user profile", async () => {
    const user = {
      name: "John Doe",
      email: "eroni@devtarfu.ht",
      password: "519087",
    }

    await request(app)
    .post("/api/v1/users")
    .send(user)

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .get(`/api/v1/profile/`)
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty("id")
    expect(response.body).toHaveProperty("name")
    expect(response.body).toHaveProperty("email")
    expect(response.body).toHaveProperty("created_at")
    expect(response.body).toHaveProperty("updated_at")

    expect(response.body.name).toBe(user.name)
    expect(response.body.email).toBe(user.email)
  })
})
