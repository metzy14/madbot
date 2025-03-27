import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import auth from './middleware/auth';
import { router as authRoutes } from './routes/auth';
import routes from './routes/index';

const app = express();

app.use(express.json());
app.use(express.raw({ type: 'application/json' })); // For webhooks
app.use(
  cors({
    origin: 'https://madbot-frontend.vercel.app',
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true, sameSite: 'lax' },
  })
);

app.use(passport.initialize());
app.use(passport.session());
auth;

app.use('/', authRoutes);
app.use('/', routes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});