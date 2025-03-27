import { Router } from 'express';
import passport from '../middleware/auth';

const router = Router();

// Login routes
router.get('/login/x', passport.authenticate('twitter'));
router.get('/login/discord', passport.authenticate('discord'));
router.get('/login/kick', passport.authenticate('kick'));

// Callback routes
router.get(
  '/callback/x',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.get(
  '/callback/discord',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

router.get(
  '/callback/kick',
  passport.authenticate('kick', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

export default router;