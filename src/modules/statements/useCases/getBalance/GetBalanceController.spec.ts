import { ICreateUserDTO } from "modules/users/useCases/createUser/ICreateUserDTO";
import  request from "supertest"
import { Connection } from "typeorm"
import { app } from "../../../../app"
import createConnection from "../../../../database"

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to get balance", async () => {

    const user = {
      id: "12345",
      name: "John Doe",
      email: "fizroon@neumso.ba",
      password: "975639",
    }

    await request(app)
    .post("/api/v1/users")
    .send(user)

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseToken.body;

    await request(app)
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

    const response = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${token}`
    })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("statement")
    expect(response.body).toHaveProperty("balance")
    expect(response.body.balance).toBe(100)
  })
})
