const { body } = require("express-validator");

const createAGroupChatValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Group name is required"),
    body("participant")
      .isArray({ min: 2, max: 100 })
      .withMessage(
        "Participants must be an array with more than 2 members and less than 100 members"
      ),
  ];
};

const updateGroupChatNameValidator = () => {
  return [body("name").trim().notEmpty().withMessage("Group name is required")];
};

module.exports = {
  createAGroupChatValidator,
  updateGroupChatNameValidator,
};
