import User from "../models/user.model.js";
import { CREATE__ACCCESS__TOKEN } from "../libs/jwt.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

// Función para registrar un nuevo usuario.  Se agregó manejo de errores y se especificó la respuesta JSON.
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const user_found = await User.findOne({ email });

    if (user_found) return res.status(400).json({ message: "Email is already in use" });

    const password_hash = await bcrypt.hash(password, 10);

    const new_user = new User({
      username,
      email,
      password: password_hash,
      role: role || "patient", // Default to patient if not provided (or 'user')
    });

    //CAPTURANDO EL USUARIO QUE SE ACABA DE GUARDAR EN LA BD
    const user_saved = await new_user.save();

    const user = {
      id: user_saved._id,
      username: user_saved.username,
      email: user_saved.email,
      role: user_saved.role,
      imgURL: user_saved.imgURL,
      telegram_id: user_saved.telegram_id,
      created_at: user_saved.createdAt,
      updated_at: user_saved.updatedAt,
    };

    const token = await CREATE__ACCCESS__TOKEN({ id: user_saved.id });

    res.status(200).json({
      message: "User successfully created.",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para iniciar sesión de un usuario. Se agregó manejo de errores y se especificó la respuesta JSON.
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user_found = await User.findOne({ email });

    if (!user_found) return res.status(400).json({ message: "User not found" });

    const is_match = await bcrypt.compare(password, user_found.password);

    if (!is_match)
      return res.status(400).json({ message: "Incorrect password" });

    const user = {
      id: user_found._id,
      username: user_found.username,
      email: user_found.email,
      role: user_found.role,
      imgURL: user_found.imgURL,
      telegram_id: user_found.telegram_id,
      created_at: user_found.createdAt,
      updated_at: user_found.updatedAt,
    };

    const token = await CREATE__ACCCESS__TOKEN({ id: user_found._id });

    res.status(200).json({
      message: "User successfully logged in.",
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para cerrar sesión de un usuario.
export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });

  return res.sendStatus(200);
};

// Función para obtener el perfil de un usuario. Se agregó manejo de errores y se especificó la respuesta JSON.
export const profile = async (req, res) => {
  const user_found = await User.findById(req.user.id);

  if (!user_found) return res.status(400).json({ message: "User not Found" });

  return res.json({
    // Se devuelve una respuesta JSON con los datos del usuario

    id: user_found._id,
    username: user_found.username,
    email: user_found.email,
    role: user_found.role,
    imgURL: user_found.imgURL,
    telegram_id: user_found.telegram_id,
    createdAt: user_found.createdAt,
    updatedAt: user_found.updatedAt,
  });
};

export const verifyToken = async (req, res) => {
  // Deshabilitar caché para este endpoint
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Remover "Bearer " si está presente
    if (token.startsWith("Bearer ")) {
      token = token.slice(7);
    }

    // Usar promisify para manejar jwt.verify de forma síncrona
    const decoded = jwt.verify(token, TOKEN_SECRET);

    const user_found = await User.findById(decoded.id);

    if (!user_found) {
      return res.status(401).json({ message: "User not found" });
    }

    // Respuesta exitosa con los datos del usuario
    const response = {
      success: true,
      user: {
        id: user_found._id,
        username: user_found.username,
        email: user_found.email,
        role: user_found.role,
        imgURL: user_found.imgURL,
        telegram_id: user_found.telegram_id,
        created_at: user_found.createdAt,
        updated_at: user_found.updatedAt,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(500).json({ message: error.message });
  }
};
