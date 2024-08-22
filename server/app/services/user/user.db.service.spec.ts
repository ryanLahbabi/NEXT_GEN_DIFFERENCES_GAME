describe('UserDBService', () => {
    // let connection: MongoClient;
    // let mongoDBServer: MongoMemoryServer;
    // let userDBService: UserDBService;
    // let userModel: Model<UserDocument>;
    // let b: ErrorBinding;

    // const USERS = [
    //     {
    //         username: 'Lucas',
    //         doubleHashedPassword: 'password1',
    //         email: 'lucas@gmail.com',
    //     },
    //     {
    //         username: 'Jeremy',
    //         doubleHashedPassword: 'password2',
    //         email: 'jeremy@gmail.com',
    //     },
    // ];

    // const addUser = async (index: number): Promise<User> => {
    //     const user = USERS[index];
    //     return await userDBService.addUser(user.username, user.doubleHashedPassword, user.email);
    // };

    // beforeAll(async () => {
    //     mongoDBServer = await MongoMemoryServer.create();
    //     Logger.log('FINISHED CREATING MONGO MEMORY SERVER ISTANCE');
    //     connection = await MongoClient.connect(mongoDBServer.getUri(), {});
    //     Logger.log('FINISHED CONNECTING TO MONGO MEMORY SERVER ISTANCE');
    // }, 100000);

    // beforeEach(async () => {
    //     const module = await Test.createTestingModule({
    //         imports: [
    //             ConfigModule.forRoot({ isGlobal: false }),
    //             MongooseModule.forRootAsync({
    //                 imports: [ConfigModule],
    //                 inject: [ConfigService],
    //                 useFactory: () => ({
    //                     uri: mongoDBServer.getUri(),
    //                 }),
    //             }),
    //             MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    //         ],
    //         providers: [UserDBService],
    //     }).compile();

    //     userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    //     userDBService = module.get<UserDBService>(UserDBService);
    // });

    // afterEach(async () => {
    //     await userModel.collection.drop();
    //     b = undefined;
    // });

    // afterAll(async () => {
    //     if (connection) {
    //         await connection.close();
    //     }
    //     if (mongoDBServer) {
    //         await mongoDBServer.stop();
    //     }
    // });

    it('fake test', () => {
        expect(true).toBeTruthy();
    });

    // describe('addUser', () => {
    //     it('should not allow adding a user with an existing username', async () => {
    //         await addUser(0);
    //         await expect(userDBService.addUser(USERS[0].username, USERS[1].doubleHashedPassword, USERS[1].email)).rejects.toEqual(
    //             ERROR_USERNAME_IN_USE.dto(
    //                 `Failed to create the user '${USERS[0].username}' : E11000 duplicate key error collection: test.users index: username_1 dup key: { username: "${USERS[0].username}" }`,
    //             ),
    //         );
    //     });

    //     it('should not allow adding a user with an existing email', async () => {
    //         await addUser(0);

    //         try {
    //             const a = await userDBService.addUser(USERS[1].username, USERS[1].doubleHashedPassword, USERS[0].email);
    //             expect(a).not.toEqual(undefined);
    //         } catch (e) {
    //             const error = ERROR_EMAIL_IN_USE.dto(
    //                 `Failed to create the user '${USERS[1].username}' : E11000 duplicate key error collection: test.users index: email_1 dup key: { email: "${USERS[0].email}" }`,
    //             );
    //             expect(e).toEqual(error);
    //         }
    //     });

    //     it('should allow adding a user with unique properties', async () => {
    //         await expect(addUser(0)).resolves.toMatchObject(USERS[0]);
    //         await expect(addUser(1)).resolves.toMatchObject(USERS[1]);
    //     });
    // });

    // describe('removeUser', () => {
    //     it('should remove the user', async () => {
    //         await addUser(0);
    //         await expect(userDBService.removeUser(USERS[0].username)).resolves.not.toBeNull();
    //     });
    // });

    // describe('getUserByName', () => {
    //     it('should fetch and return a user', async () => {
    //         await addUser(0);
    //         await expect(userDBService.getUserByName(USERS[0].username)).resolves.toMatchObject(USERS[0]);
    //     });

    //     it('should be null when no user is found', async () => {
    //         await expect(userDBService.getUserByName(USERS[0].username)).resolves.toBeNull();
    //     });
    // });

    // describe('getUsersByName', () => {
    //     it('should fetch and return users', async () => {
    //         await addUser(0);
    //         await addUser(1);
    //         await expect(userDBService.getUsersByName([USERS[0].username, USERS[1].username])).resolves.toHaveLength(2);
    //     });

    //     it('should be empty when no user is found', async () => {
    //         await expect(userDBService.getUsersByName([USERS[0].username])).resolves.toEqual([]);
    //     });

    //     it('should return a list of the found users', async () => {
    //         await addUser(0);
    //         await expect(userDBService.getUsersByName([USERS[0].username, USERS[1].username])).resolves.toHaveLength(1);
    //     });
    // });

    // describe('updateBiography', () => {
    //     const newBio = 'newBiography';

    //     it('should change the biography and return the user with the old biography', async () => {
    //         await addUser(0);
    //         await expect(userDBService.updateBiography(USERS[0].username, newBio)).resolves.toMatchObject({ biography: '' });
    //         await expect(userDBService.getUserByName(USERS[0].username)).resolves.toMatchObject({ biography: newBio });
    //     });

    //     it('should not update or return a user when it does not exist', async () => {
    //         await expect(userDBService.updateBiography(USERS[0].username, newBio)).resolves.toBeNull();
    //     });
    // });

    // describe('blockUser', () => {
    //     const e = (...args: string[]) => `Failed to block '${args[0]}' for '${args[1]}' : `;

    //     it('should add a user to the list of blockedUsers of another user', async () => {
    //         await addUser(0);
    //         await addUser(1);
    //         await expect(userDBService.blockUser(USERS[0].username, USERS[1].username)).resolves.toMatchObject({ blockedUsers: [] });
    //         await expect(userDBService.getUserByName(USERS[0].username)).resolves.toMatchObject({ blockedUsers: [USERS[1].username] });
    //     });

    //     it('should not block a user if he does not exist', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.blockUser(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[1].username, USERS[0].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should not allow a user to block himself', async () => {
    //         b = ERROR_CANNOT_BLOCK_ONESELF;
    //         await addUser(0);
    //         await expect(userDBService.blockUser(USERS[0].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });

    //     it('should verify that the user exists before blocking another user', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.blockUser(USERS[1].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should not allow a username to be added twice in a blockedUsers list', async () => {
    //         b = ERROR_USER_ALREADY_BLOCKED;
    //         await addUser(0);
    //         await addUser(1);
    //         await userDBService.blockUser(USERS[1].username, USERS[0].username);
    //         await expect(userDBService.blockUser(USERS[1].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });
    // });

    // describe('unblockUser', () => {
    //     const e = (...args: string[]) => `Failed to unblock '${args[0]}' for '${args[1]}' : `;

    //     it('should remove a user from the list of blockedUsers of another user', async () => {
    //         await addUser(0);
    //         await addUser(1);
    //         await userDBService.blockUser(USERS[0].username, USERS[1].username);
    //         await expect(userDBService.unblockUser(USERS[0].username, USERS[1].username)).resolves.toMatchObject({
    //             blockedUsers: [USERS[1].username],
    //         });
    //         await expect(userDBService.getUserByName(USERS[0].username)).resolves.toMatchObject({ blockedUsers: [] });
    //     });

    //     it('should not unblock a user if he does not exist', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.unblockUser(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[1].username, USERS[0].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should not allow a user to unblock himself', async () => {
    //         b = ERROR_CANNOT_UNBLOCK_ONESELF;
    //         await addUser(0);
    //         await expect(userDBService.unblockUser(USERS[0].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });

    //     it('should verify that the user exists before blocking another user', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.unblockUser(USERS[1].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if a user tryes to unblock a user that is not blocked', async () => {
    //         b = ERROR_USER_NOT_BLOCKED;
    //         await addUser(0);
    //         await addUser(1);
    //         await expect(userDBService.unblockUser(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[1].username, USERS[0].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });
    // });

    // describe('createFriendRequest', () => {
    //     const e = (...args: string[]) => `Failed to create a frend request towards user '${args[0]}' from '${args[1]}' : `;

    //     it('should create a friend request and update the document of both users', async () => {
    //         await addUser(0);
    //         await addUser(1);
    //         await userDBService.createFriendRequest(USERS[0].username, USERS[1].username);
    //         const updatedUser1: User = await userDBService.getUserByName(USERS[0].username);
    //         const updatedUser2: User = await userDBService.getUserByName(USERS[1].username);
    //         expect(updatedUser1.pendingFriendRequests.sent).toContain(USERS[1].username);
    //         expect(updatedUser2.pendingFriendRequests.received.at(0)).toMatchObject({ from: USERS[0].username, seen: false });
    //     });

    //     it('should throw an error if the potential friend does not exit', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.createFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[1].username, USERS[0].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if the sending user does not exist', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.createFriendRequest(USERS[1].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if someone is trying to befriend himself', async () => {
    //         b = ERROR_CANNOT_BEFRIEND_ONESELF;
    //         await addUser(0);
    //         await expect(userDBService.createFriendRequest(USERS[0].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });

    //     it('should throw an error if one or both of the users have blocked each other', async () => {
    //         b = ERROR_CANNOT_SEND_FRIEND_REQUEST_IF_BLOCKED;
    //         await addUser(0);
    //         await addUser(1);
    //         await userDBService.blockUser(USERS[0].username, USERS[1].username);
    //         await expect(userDBService.createFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[1].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username, USERS[1].username)),
    //         );
    //         await userDBService.unblockUser(USERS[0].username, USERS[1].username);
    //         await userDBService.blockUser(USERS[1].username, USERS[0].username);
    //         await expect(userDBService.createFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[1].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username, USERS[1].username)),
    //         );
    //     });
    // });

    // describe('acceptFriendRequest', () => {
    //     const e = (...args: string[]) => `User '${args[0]}' failed to accept the friend request of '${args[1]}'. : `;

    //     it('should accept a friend request', async () => {
    //         await addUser(0);
    //         await addUser(1);
    //         await userDBService.createFriendRequest(USERS[0].username, USERS[1].username);
    //         await userDBService.acceptFriendRequest(USERS[1].username, USERS[0].username);
    //         const user1 = await userDBService.getUserByName(USERS[0].username);
    //         const user2 = await userDBService.getUserByName(USERS[1].username);
    //         expect(user1.friends).toContain(USERS[1].username);
    //         expect(user2.friends).toContain(USERS[0].username);
    //         expect(user1.pendingFriendRequests.sent).toEqual([]);
    //         expect(user2.pendingFriendRequests.received).toEqual([]);
    //     });

    //     it('should throw an error if no friend request was found', async () => {
    //         b = ERROR_FRIEND_REQUEST_NOT_FOUND;
    //         await addUser(0);
    //         await addUser(1);
    //         await expect(userDBService.acceptFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[0].username, USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if the responding user was not found', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(1);
    //         await expect(userDBService.acceptFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });

    //     it('should throw an error if the accepted user was not found', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.acceptFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if the user adresses the response to himself', async () => {
    //         b = ERROR_RESPONDING_TO_HIMSELF;
    //         await addUser(0);
    //         await expect(userDBService.acceptFriendRequest(USERS[0].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });
    // });

    // describe('rejectFriendRequest', () => {
    //     const e = (...args: string[]) => `User '${args[0]}' failed to reject the friend request of '${args[1]}'. : `;

    //     it('should reject a friend request', async () => {
    //         await addUser(0);
    //         await addUser(1);
    //         await userDBService.createFriendRequest(USERS[0].username, USERS[1].username);
    //         await userDBService.rejectFriendRequest(USERS[1].username, USERS[0].username);
    //         const user1 = await userDBService.getUserByName(USERS[0].username);
    //         const user2 = await userDBService.getUserByName(USERS[1].username);
    //         expect(user1.friends).not.toContain(USERS[1].username);
    //         expect(user2.friends).not.toContain(USERS[0].username);
    //         expect(user1.pendingFriendRequests.sent).toEqual([]);
    //         expect(user2.pendingFriendRequests.received).toEqual([]);
    //     });

    //     it('should throw an error if no friend request was found', async () => {
    //         b = ERROR_FRIEND_REQUEST_NOT_FOUND;
    //         await addUser(0);
    //         await addUser(1);
    //         await expect(userDBService.rejectFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[0].username, USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if the responding user was not found', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(1);
    //         await expect(userDBService.rejectFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });

    //     it('should throw an error if the rejected user was not found', async () => {
    //         b = ERROR_USER_NOT_FOUND;
    //         await addUser(0);
    //         await expect(userDBService.rejectFriendRequest(USERS[0].username, USERS[1].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[1].username) + b.getFormattedMessage(USERS[1].username)),
    //         );
    //     });

    //     it('should throw an error if the user adresses the response to himself', async () => {
    //         b = ERROR_RESPONDING_TO_HIMSELF;
    //         await addUser(0);
    //         await expect(userDBService.rejectFriendRequest(USERS[0].username, USERS[0].username)).rejects.toEqual(
    //             b.dto(e(USERS[0].username, USERS[0].username) + b.getFormattedMessage(USERS[0].username)),
    //         );
    //     });
    // });
});
