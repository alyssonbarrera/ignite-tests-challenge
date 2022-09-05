import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { GetBalanceError } from "./GetBalanceError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;

describe("Get Balance Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to get the balance of an user", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456"
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as any,
      amount: 100,
      description: "deposit"
    })

    const result = await getBalanceUseCase.execute({ user_id: user.id as string });

    expect(result).toHaveProperty("balance");
    expect(result).toHaveProperty("statement");
    expect(result.statement).toEqual([statement]);
  });

  it("should not be able to get the balance of a non-existing user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "non-existing-user-id" });
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
