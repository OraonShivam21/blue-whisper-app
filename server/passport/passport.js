const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { Strategy: GitHubStrategy } = require("passport-github2");
const User = require("../models/user.models");
const ApiError = require("../utils/ApiError");

try {
  passport.serializeUser((user, next) => {
    next(null, user._id);
  });

  passport.deserializeUser((user, next) => {
    try {
    } catch (error) {
      next(
        new ApiError(
          500,
          "Something went wrong while deserializing the user. Error: " + error
        ),
        null
      );
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_, __, profile, next) => {
        // check if the user with email already exists
        const user = await User.findOne({ email: profile._json.email });
        if (user) {
          // if user exists, check if user has registered with GOOGLE SSO
          if (user.loginType !== "GOOGLE") {
            // if user is registered with some other method, ask them to use the same method as registered.
            // redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from backend
            next(
              new ApiError(
                400,
                `You have previously registered using ${user.loginType
                  ?.toLowerCase()
                  ?.split("_")
                  .join(" ")}. Please use the ${user.loginType
                  ?.toLowerCase()
                  ?.split("_")
                  .join(" ")} login option to access your account`
              ),
              null
            );
          } else {
            // if user is registered with the same login method send the saved user
            next(null, user);
          }
        } else {
          // if user with email does not exists, means the user is coming for the first time
          const createdUser = await User.create({
            email: profile._json.email,
            // there is a check for traditional logic so the password does not matter in this login method
            password: profile._json.sub, // set users password as sub that is coming from google
            username: profile._json.email?.split("@")[0], // as email unique, this username will be unique
            isEmailVerified: true, // email will be already verified
            role: "USER",
            avatar: {
              url: profile._json.picture,
              localPath: "",
            }, // set avatar as user's google picture
            loginType: "GOOGLE",
          });

          if (createdUser) next(null, createdUser);
          else
            next(new ApiError(500, "Error while registering the user"), null);
        }
      }
    )
  );

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (_, __, profile, next) => {
        const user = await User.findOne({ email: profile._json.email });
        if (user) {
          if (user.loginType !== "GITHUB") {
            // redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from backend
            next(
              new ApiError(
                400,
                `You have previously registered using ${user.loginType
                  ?.toLowerCase()
                  ?.split("_")
                  .join(" ")}. Please use the ${user.loginType
                  ?.toLowerCase()
                  ?.split("_")
                  .join(" ")} login option to access your account`
              ),
              null
            );
          } else {
            next(null, user);
          }
        } else {
          if (!profile._json.email)
            next(
              new ApiError(
                400,
                "User does not hae a public email associated with their account. Please try another login method."
              ),
              null
            );
          else {
            // check if user with username same as github profile username already exists
            const userNameExist = await User.findOne({
              username: profile?.username,
            });
            const createdUser = await User.create({
              email: profile._json.email,
              password: profile._json.node_id, // password is redundant for the SSO
              username: userNameExist
                ? profile._json.email?.split("@")[0]
                : profile?.username,
              isEmailVerified: true, // email will be already verified
              role: "USER",
              avatar: {
                url: profile._json.avatar_url,
                localPath: "",
              },
              loginType: "GITHUB",
            });

            if (createdUser) next(null, createdUser);
            else
              next(new ApiError(500, "Error while registering the user"), null);
          }
        }
      }
    )
  );
} catch (error) {
  console.error("Passport error:", error);
}
