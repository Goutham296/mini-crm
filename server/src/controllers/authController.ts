import bcrypt from 'bcryptjs';
import type { RequestHandler } from 'express';
import type { Env } from '../config/env.js';
import { AUTH_COOKIE, BCRYPT_ROUNDS } from '../config/constants.js';
import { User } from '../models/User.js';
import { authCookieOptions, clearCookieOptions } from '../utils/cookies.js';
import { HttpError } from '../utils/httpError.js';
import { signToken } from '../utils/jwt.js';
import { userId } from '../utils/owner.js';
import { forgotPasswordSchema, loginSchema, registerSchema } from '../validators/auth.js';

// Used to keep login timing similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync('timing-equaliser', BCRYPT_ROUNDS);

export function createAuthController(env: Env) {
  const setSession = (res: Parameters<RequestHandler>[1], id: string) => {
    res.cookie(AUTH_COOKIE, signToken(id, env.jwtSecret), authCookieOptions(env));
  };

  const register: RequestHandler = async (req, res) => {
    const { name, email, password } = registerSchema.parse(req.body);
    if (await User.exists({ email })) throw new HttpError(409, 'An account with this email already exists');
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({ name, email, passwordHash });
    setSession(res, user.id);
    res.status(201).json({ user });
  };

  const login: RequestHandler = async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email }).select('+passwordHash');
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new HttpError(401, 'Invalid email or password');
    setSession(res, user.id);
    res.json({ user });
  };

  const logout: RequestHandler = (_req, res) => {
    res.clearCookie(AUTH_COOKIE, clearCookieOptions(env));
    res.json({ message: 'Logged out' });
  };

  const me: RequestHandler = async (req, res) => {
    const user = await User.findById(userId(req));
    if (!user) throw new HttpError(401, 'Not authenticated');
    res.json({ user });
  };

  /** Stub: validates input and always answers the same way so accounts can't be enumerated. */
  const forgotPassword: RequestHandler = (req, res) => {
    forgotPasswordSchema.parse(req.body);
    res.json({ message: 'If an account exists for that email, a reset link has been sent.' });
  };

  return { register, login, logout, me, forgotPassword };
}
