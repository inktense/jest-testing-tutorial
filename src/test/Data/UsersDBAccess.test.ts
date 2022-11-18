import { UsersDBAccess } from "../../app/Data/UsersDBAccess";
import { User } from "../../app/Models/UserModels";
import * as Nedb from "nedb";

jest.mock("nedb");

describe("UsersDBAccess test suite", () => {
  let usersDBAccess: UsersDBAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
  };

  const user: User = {
    id: "id",
    name: "user",
    age: 20,
    email: "test@test.com",
    workingPosition: 0,
  };

  beforeEach(() => {
    usersDBAccess = new UsersDBAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("test putUser", () => {
    it("should store user with no error", async () => {
      nedbMock.insert.mockImplementationOnce((someUser: any, cb: any) => {
        cb();
      });
      await usersDBAccess.putUser(user);

      expect(nedbMock.insert).toBeCalledWith(user, expect.any(Function));
    });

    it("should store user with error", async () => {
      nedbMock.insert.mockImplementationOnce((someUser: any, cb: any) => {
        cb(new Error("something went wrong"));
      });
      await expect(usersDBAccess.putUser(user)).rejects.toThrow(
        "something went wrong"
      );

      expect(nedbMock.insert).toBeCalledWith(user, expect.any(Function));
    });
  });

  describe("test getUsersByName", () => {
    it("should get users with no error", async () => {
      nedbMock.find.mockImplementationOnce((someUser: any, cb: any) => {
        cb(null, [user]);
      });
      const users = await usersDBAccess.getUsersByName(user.name);

      expect(users).toEqual([user]);
      expect(nedbMock.find).toBeCalledWith(
        { name: 'user' },
        expect.any(Function)
      );
    });

    it("should get users with error", async () => {
      nedbMock.find.mockImplementationOnce((someUser: any, cb: any) => {
        cb(new Error("something went wrong"));
      });
      await expect(usersDBAccess.getUsersByName(user.name)).rejects.toThrow(
        "something went wrong"
      );

      expect(nedbMock.find).toBeCalledWith(
        { name: 'user' },
        expect.any(Function)
      );
    });

});
});
