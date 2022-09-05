import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

describe("Create Statement Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to create a new deposit", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456"
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as any,
      amount: 100,
      description: "deposit"
    });

    expect(deposit).toHaveProperty("id");
    expect(deposit).toHaveProperty("user_id");
    expect(deposit).toHaveProperty("type");
    expect(deposit).toHaveProperty("amount");
    expect(deposit).toHaveProperty("description");
  });

  it("should be able to create a new withdraw", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456"
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as any,
      amount: 100,
      description: "deposit"
    });

    const withdraw = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "withdraw" as any,
      amount: 50,
      description: "withdraw"
    })

    const { balance } = await getBalanceUseCase.execute({
      user_id: user.id as string
    });

    expect(withdraw).toHaveProperty("id");
    expect(withdraw).toHaveProperty("user_id");
    expect(withdraw).toHaveProperty("type");
    expect(withdraw).toHaveProperty("amount");
    expect(withdraw).toHaveProperty("description");

    expect(balance).toEqual(deposit.amount - withdraw.amount);
  })

  it("should not be able to create a new withdraw with insufficient funds", async () => {
    expect(async () => {
      const user = await inMemoryUsersRepository.create({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456"
      });

      await createStatementUseCase.execute({
        user_id: user.id as string,
        type: "withdraw" as any,
        amount: 50,
        description: "withdraw"
      })
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  })

  it("should not be able to create a new statement with a non-existing user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "non-existing-user-id",
        type: "deposit" as any,
        amount: 100,
        description: "deposit"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
