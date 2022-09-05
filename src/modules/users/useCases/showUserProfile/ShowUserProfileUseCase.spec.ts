import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile Use Case", () => {

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  })

  it("should be able to show the user profile", async () => {
    const user = await createUserUseCase.execute({
      name: "John Doe",
      email: "johndoe@email.com",
      password: "123456"
    });

    const result = await showUserProfileUseCase.execute(user.id as string);

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("name");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("password");
  });

  it("should not be able to show the profile of a nonexistent user", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("nonexistent user id");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
