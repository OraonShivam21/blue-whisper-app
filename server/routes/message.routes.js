const { Router } = require("express");
const {
  getAllMessages,
  sendMessage,
} = require("../controllers/message.controllers");
const { verifyJWT } = require("../middlewares/auth.middlewares");
const upload = require("../middlewares/multer.middlewares");
const { sendMessageValidator } = require("../validators/message.validators");
const {
  mongoIdPathVariableValidator,
} = require("../validators/mongodb.validators");
const validate = require("../validators/validate.validators");

const router = Router();

router.use(verifyJWT);

router
  .route("/:chatId")
  .get(mongoIdPathVariableValidator("chatId"), validate, getAllMessages)
  .post(
    upload.fields([{ name: "attachments", maxCount: 5 }]),
    sendMessageValidator(),
    validate,
    sendMessage
  );

module.exports = router;
