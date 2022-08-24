import express from "express";
import multer from "multer";
import fs from "fs";
import util from "util";
import { registerUser } from "../use-cases/users/register-user.js";
import { showAllUsers } from "../use-cases/users/show-all-users.js";
import { showUserProfile } from "../use-cases/users/show-user-profile.js";
import { loginUser } from "../use-cases/users/login-user.js";
import { makeDoAuthMiddleware } from "../auth/doAuthMiddleware.js";
import { refreshUserToken } from "../use-cases/users/refresh-user-token.js";
import { editUser } from "../use-cases/users/edit-user.js";
import { uploadFile, deleteFile } from "../utils/s3/s3-profile.js";
import { generateSignedAvatarUrl } from "../utils/s3/s3-avatar-signature.js";
import { resizeAvatar, resizeBanner } from "../utils/s3/sharp-resize.js";
import { followUser } from "../use-cases/users/follow-unfollow-user.js";
import { changeUserAvatar } from "../use-cases/users/change-user-avatar.js";
import { changeUserBanner } from "../use-cases/users/change-user-banner.js";
import { deleteUserAvatar } from "../use-cases/users/delete-user-avatar.js";
import { deleteUserBanner } from "../use-cases/users/delete-user-banner.js";
import { sendAuthMail } from "../use-cases/users/send-auth-mail.js";
import { verifyUser } from "../use-cases/users/verify-user.js";
import { showUserProfileShort } from "../use-cases/users/show-user-profile-short.js";
import { showFollowingUsers } from "../use-cases/users/show-following-users.js";
import { showFollowedbyUsers } from "../use-cases/users/show-followedby-users.js";

const doAuthMiddlewareAccess = makeDoAuthMiddleware();
const doAuthMiddlewareRefresh = makeDoAuthMiddleware("refresh");

export const usersRouter = express.Router();

usersRouter.get("/allusers", doAuthMiddlewareAccess, async (_, res) => {
	try {
		const allUsers = await showAllUsers();
		res.status(200).json(allUsers);
	} catch (err) {
		res.status(404).json({ message: err.message || "404 not found" });
	}
});

usersRouter.get(
	"/profile/:userid",
	doAuthMiddlewareAccess,
	async (req, res) => {
		const userId = req.params.userid;
		try {
			const foundUser = await showUserProfile(userId);
			const avatarKey = foundUser.profilePictureLink;
			const bannerKey = foundUser.bannerPictureLink;
			foundUser.profilePictureLink = await generateSignedAvatarUrl(
				avatarKey
			);
			foundUser.bannerPictureLink = await generateSignedAvatarUrl(
				bannerKey
			);
			res.status(200).json(foundUser);
		} catch (err) {
			res.status(404).json({ message: err.message || "404 not found" });
		}
	}
);

usersRouter.post("/register", async (req, res) => {
	try {
		const newUser = await registerUser(req.body);
		const sendMail = await sendAuthMail(newUser.userId);
		res.status(201).json(sendMail);
	} catch (err) {
		res.status(500).json({
			message: err.message || "500 internal server error",
		});
	}
});

usersRouter.put("/verify", async (req, res) => {
	try {
		const result = await verifyUser(req.body);
		res.status(200).json({ emailVerified: result.value.emailVerified });
	} catch (err) {
		res.status(500).json({
			message: err.message || "500 internal server error",
		});
	}
});

usersRouter.post("/login", async (req, res) => {
	try {
		const { accessToken, refreshToken } = await loginUser(req.body);
		if (refreshToken) {
			req.session.refreshToken = refreshToken;
		}
		res.status(200).json({ accessToken });
	} catch (err) {
		res.status(401).json({ message: err.message || "401 unauthorized" });
	}
});

usersRouter.get("/logout", async (req, res) => {
	req.session.refreshToken = null;
	res.status(204).end();
});

usersRouter.post("/refreshtoken", doAuthMiddlewareRefresh, async (req, res) => {
	try {
		const userId = req.userClaims.sub;
		const result = await refreshUserToken({ userId });
		res.status(200).json(result);
	} catch (err) {
		res.status(401).json({ message: err.message || "401 unauthorized" });
	}
});

usersRouter.post("/edit", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.userClaims.sub;
		const updatedUser = await editUser(userId, req.body);
		res.status(200).json(updatedUser);
	} catch (err) {
		res.status(401).json({ message: err.message || "401 unauthorized" });
	}
});

usersRouter.put("/follow", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.userClaims.sub;
		const newFollower = await followUser(req.body, userId);
		res.status(204).json(newFollower);
	} catch (err) {
		res.status(500).json({
			message: err.message || "500 internal server error",
		});
	}
});

// ****************************** IMAGE UPLOAD ******************************

const avatarPicStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/avatarpictures");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "_" + file.originalname); //Appending extension
	},
});

const bannerPicStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "uploads/bannerpictures");
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + "_" + file.originalname); //Appending extension
	},
});

const checkFileType = (req, file, cb) => {
	if (
		file.mimetype == "image/png" ||
		file.mimetype == "image/jpg" ||
		file.mimetype == "image/jpeg" ||
		file.mimetype == "image/gif"
	) {
		cb(null, true);
	} else {
		cb(null, false);
		return cb(new Error("Only .gif, .png, .jpg and .jpeg format allowed"));
	}
};

const uploadAvatarImage = multer({
	storage: avatarPicStorage,
	fileFilter: checkFileType,
}).single("avatarimage");
const uploadBannerImage = multer({
	storage: bannerPicStorage,
	fileFilter: checkFileType,
}).single("bannerimage");

const unlinkFile = util.promisify(fs.unlink);

usersRouter.put(
	"/avatarimage",
	doAuthMiddlewareAccess,
	uploadAvatarImage,
	async (req, res) => {
		try {
			const userId = req.userClaims.sub;
			const file = req.file;
			const originalLocalFilePath = file.path;
			// const newLocalFilePath = await resizeAvatar(file);
			const awsAnswer = await uploadFile(originalLocalFilePath, file);
			const s3Key = awsAnswer.key;
			const result = await changeUserAvatar(userId, s3Key);
			await unlinkFile(originalLocalFilePath);
			// await unlinkFile(newLocalFilePath);
			res.status(201).json(result);
		} catch (err) {
			res.status(500).json({
				message: err.message || "500 internal server error.",
			});
		}
	}
);

usersRouter.get("/profileshort", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.userClaims.sub;
		const result = await showUserProfileShort(userId);
		res.status(200).json(result);
	} catch (err) {
		res.status(404).json({
			message: err.message || "404 not found",
		});
	}
});

usersRouter.get("/following/:id", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.params.id;
		const result = await showFollowingUsers(userId);
		res.status(200).json(result);
	} catch (err) {
		res.status(404).json({
			message: err.message || "404 not found",
		});
	}
});

usersRouter.get("/followedby/:id", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.params.id;
		const result = await showFollowedbyUsers(userId);
		res.status(200).json(result);
	} catch (err) {
		res.status(404).json({
			message: err.message || "404 not found",
		});
	}
});

usersRouter.delete("/avatarimage", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.userClaims.sub;
		const result = await deleteUserAvatar(userId);
		res.status(204).json(result);
	} catch (err) {
		res.status(500).json({
			message: err.message || "500 internal server error.",
		});
	}
});

usersRouter.put(
	"/bannerimage",
	doAuthMiddlewareAccess,
	uploadBannerImage,
	async (req, res) => {
		try {
			const userId = req.userClaims.sub;
			const file = req.file;
			const originalLocalFilePath = file.path;
			const newLocalFilePath = await resizeBanner(file);
			const awsAnswer = await uploadFile(newLocalFilePath, file);
			const s3Key = awsAnswer.key;
			const result = await changeUserBanner(userId, s3Key);
			await unlinkFile(originalLocalFilePath);
			await unlinkFile(newLocalFilePath);
			res.status(201).json(result.value.bannerPictureLink);
		} catch (err) {
			res.status(500).json({
				message: err.message || "500 internal server error.",
			});
		}
	}
);

usersRouter.delete("/bannerimage", doAuthMiddlewareAccess, async (req, res) => {
	try {
		const userId = req.userClaims.sub;
		const key = req.params.key;
		await deleteUserBanner(userId);
		const result = await deleteFile(key);
		res.status(204).json(result);
	} catch (err) {
		res.status(500).json({
			message: err.message || "500 internal server error.",
		});
	}
});
