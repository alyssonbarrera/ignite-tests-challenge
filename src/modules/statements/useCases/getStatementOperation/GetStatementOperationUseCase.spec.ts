import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";


let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementsOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Get Statement Operation Use Case", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getStatementsOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  })

  it("should be able to get a statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456"
    });

    const deposit = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: "deposit" as any,
      sender_id: null,
      amount: 100,
      description: "deposit"
    });

    const statement = await getStatementsOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: deposit.id as string
    });

    expect(statement).toHaveProperty("id");
    expect(statement).toHaveProperty("user_id");
    expect(statement).toHaveProperty("type");
    expect(statement).toHaveProperty("amount");
    expect(statement).toHaveProperty("description");
  });

  it("should not be able to get a statement operation from a non-existent user", async () => {
    expect(async() => {
      await getStatementsOperationUseCase.execute({
        user_id: "non-existent-user",
        statement_id: "non-existent-statement"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement operation from a non-existent statement", async () => {
    expect(async() => {
      const user = await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456"
      });

      await getStatementsOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "non-existent-statement"
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
