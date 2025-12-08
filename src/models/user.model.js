import mongoose from "mongoose";

const user_model = new mongoose.Schema({

    username: {

        type: String,
        required: true,
        trim: true // Limpiar espacios en blanco

    },

    email: {

        type: String,
        required: true,
        trim: true,
        unique: true // que sea unico

    },

    password: {

        type: String,
        required: true

    },

    role: {
        type: String,
        enum: ['user', 'admin'], // Define los roles posibles
        default: 'user' // Establece un valor predeterminado
    },

    imgURL: {
        type: String, // Almacena la URL de la imagen
        default: '' // Valor predeterminado vacío
    },

}, {

    timestamps: true

});


export default mongoose.model('User', user_model);