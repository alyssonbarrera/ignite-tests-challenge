import { Connection } from "typeorm"
import  request from "supertest"

import { app } from "../../../../app"

import createConnection from "../../../../database"

let connection: Connection;

describe("Create Statement Controller", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it("should be able to create a new deposit statement", async () => {
    const user = {
      id: "b6b145e0-eaf4-56a7-adca-2651ee8c1305",
      name: "John Doe",
      email: "ha@nepo.am",
      password: "398610",
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

    expect(statement.status).toBe(201)
    expect(statement.body).toHaveProperty("id")
    expect(statement.body).toHaveProperty("user_id")
    expect(statement.body).toHaveProperty("type")
    expect(statement.body).toHaveProperty("amount")
    expect(statement.body).toHaveProperty("description")
    expect(statement.body).toHaveProperty("created_at")
    expect(statement.body).toHaveProperty("updated_at")

    expect(statement.body.type).toEqual("deposit")
    expect(statement.body.amount).toEqual(100)
    expect(statement.body.description).toEqual("Deposit test")
  });

  it("should be able to create a new withdraw statement", async () => {
    const user = {
      id: "b930eb0a-ad8b-557f-b34c-36948d4cd16e",
      name: "John Doe",
      email: "jenme@bonefu.nc",
      password: "114860",
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

    const withdraw = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      user_id: user.id,
      type: "withdraw",
      amount: 100,
      description: "Withdraw test"
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(withdraw.status).toBe(201)
    expect(withdraw.body).toHaveProperty("id")
    expect(withdraw.body).toHaveProperty("user_id")
    expect(withdraw.body).toHaveProperty("type")
    expect(withdraw.body).toHaveProperty("amount")
    expect(withdraw.body).toHaveProperty("description")
    expect(withdraw.body).toHaveProperty("created_at")
    expect(withdraw.body).toHaveProperty("updated_at")

    expect(withdraw.body.type).toEqual("withdraw")
    expect(withdraw.body.amount).toEqual(100)
    expect(withdraw.body.description).toEqual("Withdraw test")
  });

  it("should not be able to create a new withdraw statement if the user does not have enough funds", async () => {
    const user = {
      id: "773a3517-cfe9-59b0-a5dd-4d1cbae1fefa",
      name: "John Doe",
      email: "sic@kicu.gi",
      password: "239828",
    }

    await request(app)
    .post("/api/v1/users")
    .send(user)

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: user.email,
      password: user.password,
    });

    const { token } = responseToken.body;

    const withdraw = await request(app)
    .post("/api/v1/statements/withdraw")
    .send({
      user_id: user.id,
      type: "withdraw",
      amount: 100,
      description: "Withdraw test"
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    expect(withdraw.status).toBe(400)
    expect(withdraw.body.message).toEqual("Insufficient funds")
  });

  it("should be able to create a new transfer statement", async () => {
    const sender = {
      name: "John Doe",
      email: "vod@depebe.kw",
      password: "239828",
    }
    const receiver = {
      name: "John Doe",
      email: "newer@los.it",
      password: "239828",
    }

    await request(app)
    .post("/api/v1/users")
    .send(sender)

    await request(app)
    .post("/api/v1/users")
    .send(receiver)

    const responseTokenSender = await request(app).post("/api/v1/sessions").send({
      email: sender.email,
      password: sender.password,
    });

    const responseTokenReceiver = await request(app).post("/api/v1/sessions").send({
      email: receiver.email,
      password: receiver.password,
    });

    const { token: tokenSender } = responseTokenSender.body;

    const { id: receiver_id } = responseTokenReceiver.body.user;
    const { token: tokenReceiver } = responseTokenReceiver.body;

    await request(app)
    .post("/api/v1/statements/deposit")
    .send({
      amount: 100,
      description: "Deposit test"
    })
    .set({
      Authorization: `Bearer ${tokenSender}`,
    })

    const transfer = await request(app)
    .post(`/api/v1/statements/transfer/${receiver_id}`)
    .send({
      amount: 100,
      description: "Transfer test"
    })
    .set({
      Authorization: `Bearer ${tokenSender}`,
    })

    const receiverSwing = await request(app)
    .get("/api/v1/statements/balance")
    .set({
      Authorization: `Bearer ${tokenReceiver}`,
    })

    expect(transfer.status).toBe(201)

    expect(transfer.body).toHaveProperty("id")
    expect(transfer.body).toHaveProperty("user_id")
    expect(transfer.body).toHaveProperty("type")
    expect(transfer.body).toHaveProperty("amount")
    expect(transfer.body).toHaveProperty("description")
    expect(transfer.body).toHaveProperty("created_at")
    expect(transfer.body).toHaveProperty("updated_at")

    expect(transfer.body.type).toEqual("transfer")
    expect(transfer.body.amount).toEqual(100)
    expect(transfer.body.description).toEqual("Transfer test")

    expect(receiverSwing.body.balance).toEqual(100)
    expect(receiverSwing.body.statement.length).toEqual(1)
    expect(receiverSwing.body.statement[0].type).toEqual("transfer")
    expect(receiverSwing.body.statement[0].amount).toEqual(100)
    expect(receiverSwing.body.statement[0].description).toEqual("Transfer test")
    expect(receiverSwing.body.statement[0].sender_id).toEqual(responseTokenSender.body.user.id)
  });

  it("should not be able to create a new transfer statement if the user does not have enough funds", async () => {
    const sender = {
      name: "John Doe",
      email: "vod@depebe.kw",
      password: "239828",
    }
    const receiver = {
      name: "John Doe",
      email: "newer@los.it",
      password: "239828",
    }

    await request(app)
    .post("/api/v1/users")
    .send(sender)

    await request(app)
    .post("/api/v1/users")
    .send(receiver)

    const responseTokenSender = await request(app).post("/api/v1/sessions").send({
      email: sender.email,
      password: sender.password,
    });

    const responseTokenReceiver = await request(app).post("/api/v1/sessions").send({
      email: receiver.email,
      password: receiver.password,
    });

    const { token: tokenSender } = responseTokenSender.body;
    const { id: receiver_id } = responseTokenReceiver.body.user;

    const transfer = await request(app)
    .post(`/api/v1/statements/transfer/${receiver_id}`)
    .send({
      amount: 100,
      description: "Transfer test"
    })
    .set({
      Authorization: `Bearer ${tokenSender}`,
    })

    expect(transfer.status).toBe(400)
    expect(transfer.body.message).toEqual("Insufficient funds")
  });
});
