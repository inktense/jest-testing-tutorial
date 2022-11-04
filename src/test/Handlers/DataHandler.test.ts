import { DataHandler } from "../../app/Handlers/DataHandler"
import { HTTP_METHODS, HTTP_CODES, SessionToken, TokenState } from "../../app/Models/ServerModels"
import { Utils } from "../../app/Utils/Utils"
import { User, WorkingPosition } from "../../app/Models/UserModels";

const someUser: User[] = [{
    age: 123,
    email: 'some@email.com',
    id: '1234',
    name: 'Some Name',
    workingPosition: WorkingPosition.PROGRAMMER
}]

describe('DataHandler test suite', () => {
    let dataHandler: DataHandler;

    const requestMock = {
        method: '',
        headers: {
            authorization: ''
        }
    };
    const responseMock = {
        writeHead: jest.fn(),
        write: jest.fn(),
        statusCode: 0
    };
    const tokenValidatorMock = {
        validateToken: jest.fn()
    };
    const usersDBAccessMock = {
        getUsersByName: jest.fn()
    };
    const parseUrlMock = jest.fn();

    beforeEach(() => {
        dataHandler = new DataHandler(
            requestMock as any,
            responseMock as any,
            tokenValidatorMock as any,
            usersDBAccessMock as any
        );
        Utils.parseUrl = parseUrlMock;
    })

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('test options request', async () => {
        requestMock.method = HTTP_METHODS.OPTIONS;
        await dataHandler.handleRequest();

        expect(responseMock.writeHead).toBeCalledWith(HTTP_CODES.OK)
    })

    it('test not handled http method', async () => {
        requestMock.method = 'someMethod';
        await dataHandler.handleRequest();

        expect(responseMock.writeHead).not.toHaveBeenCalled();
    })

    it('test get request with operation authorized', async () => {
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'token';
        tokenValidatorMock.validateToken.mockReturnValueOnce({
            accessRights: [1, 2, 3],
            state: TokenState.VALID
        });
        parseUrlMock.mockReturnValueOnce({
            query: {
                name: 'someName'
            }
        });
        usersDBAccessMock.getUsersByName.mockReturnValueOnce(someUser);
        await dataHandler.handleRequest();

        expect(usersDBAccessMock.getUsersByName).toBeCalledWith('someName');
        expect(responseMock.writeHead).toBeCalledWith(
            HTTP_CODES.OK, { 'Content-Type': 'application/json' }
        );
        expect(responseMock.write).toBeCalledWith(JSON.stringify(someUser));
    })

    it('test get request with operation unauthorized', async () => {
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'token';
        tokenValidatorMock.validateToken.mockReturnValueOnce({
            accessRights: [2, 3],
            state: TokenState.VALID
        });
        await dataHandler.handleRequest();

        expect(responseMock.statusCode).toBe(HTTP_CODES.UNAUTHORIZED);
        expect(responseMock.write).toBeCalledWith('Unauthorized operation!');
    })

    it('test get request with no query name', async () => {
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'token';
        tokenValidatorMock.validateToken.mockReturnValueOnce({
            accessRights: [1, 2, 3],
            state: TokenState.VALID
        });
        parseUrlMock.mockReturnValueOnce({
            query: { }
        });
        await dataHandler.handleRequest();

        expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
        expect(responseMock.write).toBeCalledWith('Missing name parameter in the request!');
    })

    it('test get request with unexpected error', async () => {
        requestMock.method = HTTP_METHODS.GET;
        requestMock.headers.authorization = 'someTokenId';
        tokenValidatorMock.validateToken.mockRejectedValue(new Error('something went wrong!'));
        parseUrlMock.mockReturnValueOnce({
            query: {
            }
        });
        await dataHandler.handleRequest();

        expect(responseMock.statusCode).toBe(HTTP_CODES.INTERNAL_SERVER_ERROR)
        expect(responseMock.write).toBeCalledWith('Internal error: something went wrong!')
    })

    it('test not handled http method', async () => {
        requestMock.method = 'someMethod';
        await dataHandler.handleRequest();

        expect(responseMock.write).not.toHaveBeenCalled();
        expect(responseMock.writeHead).not.toHaveBeenCalled();
    })
})