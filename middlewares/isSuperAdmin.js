import dotenv from "dotenv";
dotenv.config();

export const isSuperAdmin = (req, res, next) => {
  const { email, password } = req.body;

  const superEmails = process.env.SUPERADMINS_EMAILS.split(",");
  const superPasswords = process.env.SUPERADMINS_PASSWORDS.split(",");

  // মিল খুঁজুন
  const index = superEmails.findIndex((em, i) => em === email && superPasswords[i] === password);

  if (index !== -1) {
    next(); // অনুমোদিত
  } else {
    return res.status(403).json({ message: "Unauthorized! Only Super Admin allowed." });
  }
};




