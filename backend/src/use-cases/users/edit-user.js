import UserDAO from "../../db-access/users-dao.js";
import { makeUser } from "../../domain/User.js";
import { createHash, createRandomHash } from "../../utils/hash.js";

export const editUser = async (userId, {
    username,
    firstName,
    lastName,
    password,
    dob,
    bio
}) => {
    const user = await UserDAO.findUserById(userId);

    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (dob) user.dob = dob;
    if (bio) user.bio = bio;

    if (password) {
        user.passwordSalt = createRandomHash()
        user.passwordHash = createHash(password + '' + passwordSalt)
    }

    const updateUserInfo = makeUser(user)

    const insertResult = await UserDAO.updateOneUser(updateUserInfo)
    const userView = ({
        username: insertResult.value.username,
        firstName: insertResult.value.firstName,
        lastName: insertResult.value.lastName,
        dob: insertResult.value.dob,
        bio: insertResult.value.bio
    })

    return userView;
}