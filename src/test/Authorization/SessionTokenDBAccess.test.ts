// Testing callbacks
import { SessionTokenDBAccess } from "../../app/Authorization/SessionTokenDBAccess";
import * as Nedb from "nedb";
import { SessionToken } from "../../app/Models/ServerModels";

jest.mock("nedb");

describe("SessionTokenDBAccess test suite", () => {
  let sessionTokenDBAccess: SessionTokenDBAccess;

  const nedbMock = {
    loadDatabase: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  const token: SessionToken = {
    accessRights: [],
    expirationTime: new Date(),
    tokenId: "id",
    userName: "user",
    valid: true,
  };

  beforeEach(() => {
    sessionTokenDBAccess = new SessionTokenDBAccess(nedbMock as any);
    expect(nedbMock.loadDatabase).toBeCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("constructor argument", async () => {
    new SessionTokenDBAccess();
    expect(Nedb).toBeCalledWith("databases/sessionToken.db");
  });

  describe("test storeSessionToken", () => {
    it("should store sessionToken without error", async () => {
      nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
        cb();
      });
      await sessionTokenDBAccess.storeSessionToken(token);

      expect(nedbMock.insert).toBeCalledWith(token, expect.any(Function));
    });

    it("should store sessionToken with error", async () => {
      nedbMock.insert.mockImplementationOnce((someToken: any, cb: any) => {
        cb(new Error("something went wrong"));
      });
      await expect(
        sessionTokenDBAccess.storeSessionToken(token)
      ).rejects.toThrow("something went wrong");

      expect(nedbMock.insert).toBeCalledWith(token, expect.any(Function));
    });
  });

  describe("test getToken", () => {
    it("should get token witho no result and no error", async () => {
      nedbMock.find.mockImplementationOnce((someTokenId: string, cb: any) => {
        cb(null, []);
      });
      await sessionTokenDBAccess.getToken(token.tokenId);

      expect(nedbMock.find).toBeCalledWith(
        { tokenId: token.tokenId },
        expect.any(Function)
      );
    });

    it("should get token with result and no error", async () => {
      nedbMock.find.mockImplementationOnce((someTokenId: string, cb: any) => {
        cb(null, [token]);
      });
      const tokenResult = await sessionTokenDBAccess.getToken(token.tokenId);

      expect(tokenResult).toBe(token);
      expect(nedbMock.find).toBeCalledWith(
        { tokenId: token.tokenId },
        expect.any(Function)
      );
    });

    it("should get token with error", async () => {
      nedbMock.find.mockImplementationOnce((someTokenId: string, cb: any) => {
        cb(new Error("something went wrong"), []);
      });
      await expect(
        sessionTokenDBAccess.getToken(token.tokenId)
      ).rejects.toThrow("something went wrong");

      expect(nedbMock.find).toBeCalledWith(
        { tokenId: token.tokenId },
        expect.any(Function)
      );
    });

    describe("test deleteToken", () => {
      it("should delete token without error", async () => {
        nedbMock.remove.mockImplementationOnce(
          (someTokenId: string, options: any, cb: any) => {
            cb(null, 1);
          }
        );
        await sessionTokenDBAccess.deleteToken(token.tokenId);

        expect(nedbMock.remove).toBeCalledWith(
          { tokenId: token.tokenId },
          {},
          expect.any(Function)
        );
      });

      it("should try delete token with error", async () => {
        nedbMock.remove.mockImplementationOnce(
          (someTokenId: string, options: any, cb: any) => {
            cb(new Error("something went wrong"), 0);
          }
        );
        await expect(
          sessionTokenDBAccess.deleteToken(token.tokenId)
        ).rejects.toThrow("something went wrong");

        expect(nedbMock.remove).toBeCalledWith(
          { tokenId: token.tokenId },
          {},
          expect.any(Function)
        );
      });

      it("should not delete token", async () => {
        nedbMock.remove.mockImplementationOnce(
          (someTokenId: string, options: any, cb: any) => {
            cb(null, 0);
          }
        );
        await expect(
          sessionTokenDBAccess.deleteToken('')
        ).rejects.toThrow("Session token not deleted");

        expect(nedbMock.remove).toBeCalledWith(
          { tokenId: "" },
          {},
          expect.any(Function)
        );
      });
    });
  });
});
