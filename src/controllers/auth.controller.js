import User from "../models/user.model.js";
import { CREATE__ACCCESS__TOKEN } from "../libs/jwt.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";




// Función para registrar un nuevo usuario.  Se agregó manejo de errores y se especificó la respuesta JSON.
export const register = async (req, res) => {

    const { username, email, password } = req.body;

    try {

        const user_found = await User.findOne({ email });

        if (user_found)
            return res.status(400).json(["Email is already in use"]);

        const password_hash = await bcrypt.hash(password, 10);

        const new_user = new User({

            username,
            email,
            password: password_hash

        });


        //CAPTURANDO EL USUARIO QUE SE ACABA DE GUARDAR EN LA BD
        const user_saved = await new_user.save();

        const user = {
            id: user_saved._id,
            username: user_saved.username,
            email: user_saved.email,
            role: user_saved.role,
            imgURL: user_saved.imgURL,
            created_at: user_saved.createdAt,
            updated_at: user_saved.updatedAt
        };



        const token = await CREATE__ACCCESS__TOKEN({ id: user_saved.id });

        res.status(200).json({ message: "User successfully created.", token, user });

    }
    catch (error) {

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

        if (!is_match) return res.status(400).json({ message: "Incorrect password" });


        const user = {
            id: user_found._id,
            username: user_found.username,
            email: user_found.email,
            role: user_found.role,
            imgURL: user_found.imgURL,
            created_at: user_found.createdAt,
            updated_at: user_found.updatedAt
        };


        const token = await CREATE__ACCCESS__TOKEN({ id: user_found._id });

        res.status(200).json({ message: "User successfully logged in.", token, user });

    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }

};


// Función para cerrar sesión de un usuario.
export const logout = (req, res) => {

    res.cookie('token', "", {
        expires: new Date(0)
    });

    return res.sendStatus(200);
};


// Función para obtener el perfil de un usuario. Se agregó manejo de errores y se especificó la respuesta JSON.
export const profile = async (req, res) => {

    const user_found = await User.findById(req.user.id);

    if (!user_found) return res.status(400).json({ message: "User not Found" });

    return res.json({ // Se devuelve una respuesta JSON con los datos del usuario

        id: user_found._id,
        username: user_found.username,
        email: user_found.email,
        role: user_found.role,
        imgURL: user_found.imgURL,
        createdAt: user_found.createdAt,
        updatedAt: user_found.updatedAt,

    });

};



export const verifyToken = async (req, res) => {
    // Deshabilitar caché para este endpoint
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });

    console.log('=== VERIFY TOKEN DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Authorization header:', req.header('Authorization'));
    
    try {
        let token = req.header('Authorization');
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ message: "No token provided" });
        }

        console.log('🔍 Token received:', token.substring(0, 20) + '...');

        // Remover "Bearer " si está presente
        if (token.startsWith('Bearer ')) {
            token = token.slice(7);
            console.log('✂ Removed Bearer prefix');
        }

        // Usar promisify para manejar jwt.verify de forma síncrona
        const decoded = jwt.verify(token, TOKEN_SECRET);
        console.log('✅ Token decoded successfully:', decoded);
        
        // --- NEW LOGS START ---
        console.log('🆔 User ID from Token:', decoded.id); 
        // --- NEW LOGS END ---
        
        const user_found = await User.findById(decoded.id);

        if (!user_found) {
            console.log('❌ User not found in database');
            return res.status(401).json({ message: "User not found" });
        }

        console.log('✅ User found:', user_found.username);
        console.log('🆔 User ID from DB:', user_found._id); // Log DB ID as well

        // Respuesta exitosa con los datos del usuario
        const response = {
            success: true,
            user: {
                id: user_found._id,
                username: user_found.username,
                email: user_found.email,
                role: user_found.role,
                imgURL: user_found.imgURL,
                created_at: user_found.createdAt,
                updated_at: user_found.updatedAt
            }
        };

        console.log('📤 Sending response:', response);
        return res.status(200).json(response);

    } catch (error) {
        console.log('❌ Error in verifyToken:', error.message);
        // Si jwt.verify falla, llegará aquí
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(500).json({ message: error.message });
    }
};




// export const verifyToken = async (req, res) => {
//     // Deshabilitar caché para este endpoint
//     res.set({
//         'Cache-Control': 'no-cache, no-store, must-revalidate',
//         'Pragma': 'no-cache',
//         'Expires': '0'
//     });

//     console.log('=== VERIFY TOKEN DEBUG ===');
//     console.log('Headers:', req.headers);
//     console.log('Authorization header:', req.header('Authorization'));
    
//     try {
//         let token = req.header('Authorization');
        
//         if (!token) {
//             console.log('❌ No token provided');
//             return res.status(401).json({ message: "No token provided" });
//         }

//         console.log('🔍 Token received:', token.substring(0, 20) + '...');

//         // Remover "Bearer " si está presente
//         if (token.startsWith('Bearer ')) {
//             token = token.slice(7);
//             console.log('✂️ Removed Bearer prefix');
//         }

//         // Usar promisify para manejar jwt.verify de forma síncrona
//         const decoded = jwt.verify(token, TOKEN_SECRET);
//         console.log('✅ Token decoded successfully:', decoded);
        
//         const user_found = await User.findById(decoded.id);

//         if (!user_found) {
//             console.log('❌ User not found in database');
//             return res.status(401).json({ message: "User not found" });
//         }

//         console.log('✅ User found:', user_found.username);

//         // Respuesta exitosa con los datos del usuario
//         const response = {
//             success: true,
//             user: {
//                 id: user_found._id,
//                 username: user_found.username,
//                 email: user_found.email,
//                 role: user_found.role,
//                 imgURL: user_found.imgURL,
//                 created_at: user_found.createdAt,
//                 updated_at: user_found.updatedAt
//             }
//         };

//         console.log('📤 Sending response:', response);
//         return res.status(200).json(response);

//     } catch (error) {
//         console.log('❌ Error in verifyToken:', error.message);
//         // Si jwt.verify falla, llegará aquí
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({ message: "Invalid token" });
//         }
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({ message: "Token expired" });
//         }
//         return res.status(500).json({ message: error.message });
//     }
// };