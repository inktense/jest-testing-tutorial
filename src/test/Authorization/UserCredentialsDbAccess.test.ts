import { UserCredentialsDbAccess } from "../../app/Authorization/UserCredentialsDbAccess";
import * as Nedb from "nedb";
import { UserCredentials } from "../../app/Models/ServerModels";

jest.mock("nedb");

describe("UserCredentialsDbAccess test suite", () => {
  let userCredentialsDbAccess: UserCredentialsDbAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const user: UserCredentials = {
    username: "user",
    password: "password",
    accessRights: [1, 2, 3],
  };

  beforeEach(() => {
    userCredentialsDbAccess = new UserCredentialsDbAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("constructor argument", async () => {
    new UserCredentialsDbAccess();
    expect(Nedb).toBeCalledWith("databases/UsersCredentials.db");
  });

  describe("test putUserCredential", () => {
    it("should store sessionToken without error", async () => {
      nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
        cb();
      });
      await userCredentialsDbAccess.putUserCredential(user);

      expect(nedbMock.insert).toBeCalledWith(user, expect.any(Function));
    });

    it("should store sessionToken with error", async () => {
      nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
        cb(new Error("something went wrong"));
      });
      await expect(
        userCredentialsDbAccess.putUserCredential(user)
      ).rejects.toThrow("something went wrong");

      expect(nedbMock.insert).toBeCalledWith(user, expect.any(Function));
    });
  });

  describe("test getUserCredential", () => {
    it("should get user without error", async () => {
      nedbMock.find.mockImplementationOnce((someToken: any, cb: any) => {
        cb(undefined, [user]);
      });
      const result = await userCredentialsDbAccess.getUserCredential(
        user.username,
        user.password
      );

      expect(nedbMock.find).toBeCalledWith(
        { username: "user", password: "password" },
        expect.any(Function)
      );
      expect(result).toEqual(user);
    });

    it("should get user with error", async () => {
      nedbMock.find.mockImplementationOnce((someToken: any, cb: any) => {
        cb(new Error("something went wrong"));
      });
      await expect(
        userCredentialsDbAccess.getUserCredential(user.username, user.password)
      ).rejects.toThrow("something went wrong");

      expect(nedbMock.find).toBeCalledWith(
        { username: "user", password: "password" },
        expect.any(Function)
      );
    });

    it("should get user with no user found", async () => {
      nedbMock.find.mockImplementationOnce((someToken: any, cb: any) => {
        cb(undefined, []);
      });
      const result = await userCredentialsDbAccess.getUserCredential("", "");

      expect(nedbMock.find).toBeCalledWith(
        { username: "", password: "" },
        expect.any(Function)
      );
      expect(result).toBeNull();
    });
  });

  describe("test deleteUserCredential", () => {
    it("should delete user without error", async() => {
        nedbMock.remove.mockImplementationOnce((someToken: any, options: any, cb: any) => {
            cb(null, 1);
        });
        const result = await userCredentialsDbAccess.deleteUserCredential(user);

        expect(nedbMock.remove).toBeCalledWith(
            { username: "user", password: "password" }, {},
            expect.any(Function)
          );
        expect.any(Function)
    });

    it("should delete user with error", async() => {
        nedbMock.remove.mockImplementationOnce((someToken: any, options: any, cb: any) => {
            cb(new Error("something went wrong"));
        });
        await expect(userCredentialsDbAccess.deleteUserCredential(user)).rejects.toThrow("something went wrong");

        expect(nedbMock.remove).toBeCalledWith(
            { username: "user", password: "password" }, {},
            expect.any(Function)
          );
    });
  });

  it("should not delete user with no user found", async() => {
    nedbMock.remove.mockImplementationOnce((someToken: any, options: any, cb: any) => {
        cb(null, 0);
    });
    
    await expect(userCredentialsDbAccess.deleteUserCredential({username: '', password: '', accessRights: []})).rejects.toThrow("UserCredentials not deleted!");

    expect(nedbMock.remove).toBeCalledWith(
        { username: "", password: "" }, {},
        expect.any(Function)
      );
      expect.any(Function)
  });
});
