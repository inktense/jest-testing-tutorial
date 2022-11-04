import { Authorizer } from "../../app/Authorization/Authorizer"
import { SessionTokenDBAccess } from "../../app/Authorization/SessionTokenDBAccess"
import { UserCredentialsDbAccess } from "../../app/Authorization/UserCredentialsDbAccess"
import { Account, SessionToken, TokenState } from "../../app/Models/ServerModels"

jest.mock("../../app/Authorization/SessionTokenDBAccess")
jest.mock("../../app/Authorization/UserCredentialsDbAccess")

describe('Authorizer test suite', () => {
    let authorizer: Authorizer;

    const sessionTokenDBAccessMock = {
        storeSessionToken: jest.fn(),
        getToken: jest.fn()
    };
    const userCredentialsDbAccessMock = {
        getUserCredential: jest.fn()
    };

    beforeEach(() => {
        authorizer = new Authorizer(
            sessionTokenDBAccessMock as any,
            userCredentialsDbAccessMock as any
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    const account: Account = {
        username: 'user',
        password: 'pass'
    }

    it('constructor arguments', () => {
        new Authorizer()

        expect(SessionTokenDBAccess).toBeCalled();
        expect(UserCredentialsDbAccess).toBeCalled();
    })

    describe('login user test suite', () => {
        it('should return sessionToken for valid credentials', async() => {
            jest.spyOn(global.Math, 'random').mockReturnValueOnce(0);
            jest.spyOn(global.Date, 'now').mockReturnValueOnce(0);
    
            userCredentialsDbAccessMock.getUserCredential.mockResolvedValueOnce({
                username: 'user',
                accessRights: [1, 2, 3]
            });
            const expectedSessionToken: SessionToken = {
                userName: 'user',
                accessRights: [1, 2, 3],
                valid: true,
                tokenId: '',
                expirationTime: new Date(60 * 60 * 1000)
            }
    
            const sessionToken = await authorizer.generateToken(account);
    
            expect(expectedSessionToken).toEqual(sessionToken);
            expect(sessionTokenDBAccessMock.storeSessionToken).toBeCalledWith(sessionToken)
    
        })
    
        it('should return null for invalid credentials', async() => {
            userCredentialsDbAccessMock.getUserCredential.mockResolvedValueOnce(null);
    
            const sessionToken = await authorizer.generateToken(account);
    
            expect(sessionToken).toBeNull
        })
    })

    describe('validateToken test suite', () => {

        it('validates token for valid and not expired tokens', async() => {
            sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
                valid: true,
                accessRights: [1],
                expirationTime: new Date(Date.now() + 100000)
            })

            const sessionToken = await authorizer.validateToken('token');

            expect(sessionToken).toStrictEqual({
                state: TokenState.VALID,
                accessRights: [1]
            })
        })

        it('return expired for expired token', async() => {
            sessionTokenDBAccessMock.getToken.mockReturnValueOnce({
                valid: true,
                accessRights: [1],
                expirationTime: new Date(Date.now() - 100000)
            })

            const sessionToken = await authorizer.validateToken('token');

            expect(sessionToken).toStrictEqual({
                accessRights: [],
                state: TokenState.EXPIRED
            })
        })

        it('return invalid for null token', async() => {
            sessionTokenDBAccessMock.getToken.mockReturnValueOnce(null)
            const sessionToken = await authorizer.validateToken('token');

            expect(sessionToken).toStrictEqual({
                accessRights: [],
                state: TokenState.INVALID
            })
        })
    })

})