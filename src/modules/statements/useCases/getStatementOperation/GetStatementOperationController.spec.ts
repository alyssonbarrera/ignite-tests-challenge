import { Connection } from "typeorm"
import { app } from "../../../../app"

import  request from "supertest"
import createConnection from "../../../../database"

let connection: Connection;

describe("Get Statement Operation Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get a statement operation", async () => {

    const user = {
      id: "04d40613-cfab-5bed-adfb-c9b7de3cad38",
      name: "John Doe",
      email: "sunu@fon.je",
      password: "910711",
    }

    await request(app)
    .post("/api/v1/users")
    .send(user)

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseToken.body;

    const statement = await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      user_id: user.id,
      type: "deposit",
      amount: 100,
      description: "Deposit test"
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    const statementOperation = await request(app)
    .get(`/api/v1/statements/${statement.body.id}`)
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(statementOperation.status).toBe(200)

    expect(statementOperation.body).toHaveProperty("id")
    expect(statementOperation.body).toHaveProperty("user_id")
    expect(statementOperation.body).toHaveProperty("type")
    expect(statementOperation.body).toHaveProperty("amount")
    expect(statementOperation.body).toHaveProperty("description")
    expect(statementOperation.body).toHaveProperty("created_at")
    expect(statementOperation.body).toHaveProperty("updated_at")

    expect(statementOperation.body.id).toEqual(statement.body.id)
    expect(statementOperation.body.user_id).toEqual(statement.body.user_id)
  })
})
