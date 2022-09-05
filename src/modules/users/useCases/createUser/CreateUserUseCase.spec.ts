import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let userRepositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User Use Case", () => {
    beforeEach(() => {
        userRepositoryInMemory = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(userRepositoryInMemory);
    })

    it("should be able to create a new user", async () => {
        const user = await createUserUseCase.execute({
            name: "John Doe",
            email: "johndoe@email.com",
            password: "123456"
        })

        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("password");
    });

    it("should not be able to create a user if user already exists", async () => {
      expect(async () => {
        await createUserUseCase.execute({
          name: "John Doe",
          email: "johndoe@email.com",
          password: "123456"
        });

        await createUserUseCase.execute({
          name: "John Doe",
          email: "johndoe@email.com",
          password: "123456"
        })
      }).rejects.toBeInstanceOf(CreateUserError);
    });
})
