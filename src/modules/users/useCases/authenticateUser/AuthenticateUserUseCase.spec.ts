import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User Use Case", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to authenticate an user", async () => {
    await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456"
    })

    const result = await authenticateUserUseCase.execute({
      email: "johndoe@email.com",
      password: "123456"
    })

    expect(result).toHaveProperty("user");
    expect(result.user).toHaveProperty("id");
    expect(result.user).toHaveProperty("name");
    expect(result.user).toHaveProperty("email");
    expect(result).toHaveProperty("token");
  })

  it("should not be able to authenticate an nonexistent user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "johndoe@email.com",
        password: "123456"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })

  it("should not be able to authenticate with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "John Doe",
        email: "johndoe@email.com",
        password: "123456"
      });
      await authenticateUserUseCase.execute({
        email: "johndoe@email.com",
        password: "1234567"
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
})
