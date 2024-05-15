const User = require("../Models/User");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const maxAge = 2 * 24 * 60 * 60;
const createToken1 = (id, role) => {
  return jwt.sign({ data: { id, role } }, "sammba yero taharka sow", {
    expiresIn: maxAge,
  });
};
//creation de compte
module.exports.signupUser = async (req, res, next) => {
  const { email, password, name, role } = req.body;
  try {
    const user = await User.signup(email, password, name, role);
    const token = createToken1(user._id);
    res.status(200).json({ email, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports.loginUser = async (req, res) => {
  const { email, password, role, name } = req.body;
  try {
    const user = await User.login(email, password, name);
    const token = createToken1(user._id, user.role);
    res.status(200).json({ email, token, role:user.role, name: user.name });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});
module.exports.createAccount = async (req, res) => {
  const { email, name, pays, role } = req.body;
  const password = generateRandomPassword();

  // Hash the password using bcrypt (make sure to handle this securely in a real application)
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Enregistrez l'utilisateur dans la base de données ou effectuez d'autres opérations nécessaires
    const user =  User({
      email,
      password: hashedPassword,
      name,
      role: "medecin",
    });
    await user.save();
    const token = createToken1(user._id);
    // Envoyez un email à l'utilisateur
    const mailOptions = {
      from: "votre_email@gmail.com",
      to: email,
      subject: "Création de compte réussie",
      html: `
            <!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>CodePen - OTP Email Template</title>
  <style>
  tfoot {
    background-color: #3f87a6;
    color: #fff;
  }
  
  tbody {
    background-color: #e4f0f5;
  }
  
  caption {
    padding: 10px;
    caption-side: bottom;
  }
  
  table {
    border-collapse: collapse;
    border: 2px solid rgb(200, 200, 200);
    letter-spacing: 1px;
    font-family: sans-serif;
    font-size: 0.8rem;
  }
  
  td,
  th {
    border: 1px solid rgb(190, 190, 190);
    padding: 5px 10px;
  }
  
  td {
    text-align: center;
  }
  
  </style>
</head>
<body>
<table>
  <tbody>
  <tr>
  <th scope="row">Email</th>
  <td>${email}</td>
</tr>
    <tr>
    <th scope="row">Regions</th>
    <td>${pays}</td>
  </tr>
  
  </tbody>
</table>
</body>
<h1>Votre compte a été créé avec succès. Voici votre mot de passe temporaire : ${password}</h1>
</html>`,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({
        message:
          "Compte créé avec succès! Un email a été envoyé avec votre mot de passe.",token
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la création du compte" });
  }
};
function generateRandomPassword(length = 8) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
}
module.exports.changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifiez si le mot de passe actuel est correct
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect" });
    }

    // Hash le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Mettez à jour le mot de passe dans la base de données
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du mot de passe" });
  }
};

// Fonction pour générer un mot de passe aléatoire
function generateRandomPassword(length = 8) {
  const characters =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
}
