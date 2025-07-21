import express from 'express';
import { verifyToken } from '../middleware/verifyUser.js';
import { walletDeposit } from '../controllers/wallet.controller.js';
const router = express.Router();

router.get('/deposit', verifyToken, walletDeposit);

export default router;