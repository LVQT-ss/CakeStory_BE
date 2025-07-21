import Wallet from '../models/wallet.model.js';

export const walletDeposit = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });

    }
    catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

