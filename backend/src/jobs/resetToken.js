import User from "../models/user.model.js";

setInterval(async () => {
  await User.updateMany(
    { resetTokenExpiresAt: { $lt: new Date() } },
    { resetToken: null, resetTokenExpiresAt: null }
  );
}, [60000]);
