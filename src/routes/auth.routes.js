import { Router } from "express";

//controllers
import { login, logout, register, profile, verifyToken } from "../controllers/auth.controller.js";

//middlewares
import { auth_required } from "../middlewares/validate_token.js";
import { validate_schema } from "../middlewares/validator_schema.middleware.js";

//schemas
import { register_schema, login_schema } from "../schemas/auth.schema.js";





const auth_router = Router();

auth_router.post('/register', validate_schema(register_schema), register);

auth_router.post('/login', validate_schema(login_schema), login);

auth_router.post('/logout', logout);

auth_router.get('/profile', auth_required, profile);

auth_router.get('/verify-token', verifyToken);





export default auth_router;