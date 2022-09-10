import { Connection } from "typeorm"
import { app } from "../../../../app"

import  request from "supertest"
import createConnection from "../../../../database"

let connection: Connection;

describe("Authenticate User Controller ", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to authenticate an user", async () => {
    const user = {
      name: "John Doe",
      email: "zeiz@fu.jp",
      password: "960775",
    }

    await request(app)
    .post("/api/v1/users")
    .send(user)

    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: user.email,
      password: user.password,
    })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty("token")
    expect(response.body).toHaveProperty("user")

    expect(response.body.user).toHaveProperty("id")
    expect(response.body.user).toHaveProperty("name")
    expect(response.body.user).toHaveProperty("email")
  })

  it("should not be able to authenticate an nonexistent user", async () => {
    const response = await request(app)
    .post("/api/v1/sessions")
    .send({
      email: "to@voek.gf",
      password: "939857",
    })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty("message")
    expect(response.body.message).toEqual("Incorrect email or password")
  })
})
