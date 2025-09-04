import cron from 'node-cron';
import CakeOrder from '../models/cake_order.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import sequelize from '../database/db.js';
import Challenge from '../models/challenge.model.js';
import ChallengeEntry from '../models/challenge_entry.model.js';
import { Op } from 'sequelize';

// Tự động chuyển đơn hàng từ 'pending' sang 'ordered' sau 30 giây
const autoConfirmPendingOrders = cron.schedule('*/30 * * * * *', async () => {
  try {
    console.log('Checking for pending orders to auto-confirm...');

    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000); // 30 giây trước

    const pendingOrders = await CakeOrder.findAll({
      where: {
        status: 'pending',
        created_at: {
          [Op.lte]: thirtySecondsAgo
        }
      }
    });

    if (pendingOrders.length > 0) {
      await CakeOrder.update(
        { status: 'ordered' },
        {
          where: {
            id: {
              [Op.in]: pendingOrders.map(order => order.id)
            }
          }
        }
      );

      console.log(`Auto-confirmed ${pendingOrders.length} pending orders`);
    }
  } catch (error) {
    console.error('Error in auto-confirm scheduler:', error);
  }
}, {
  scheduled: false
});

// Tự động chuyển đơn hàng từ 'shipped' sang 'completed' sau 2 tiếng và chuyển tiền
const autoCompleteShippedOrders = cron.schedule('*/15 * * * *', async () => {
  const dbTransaction = await sequelize.transaction();

  try {
    console.log('Checking for shipped orders to auto-complete and transfer money...');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 tiếng trước

    const ordersToComplete = await CakeOrder.findAll({
      where: {
        status: 'shipped',
        updated_at: {
          [Op.lte]: twoHoursAgo
        }
      },
      transaction: dbTransaction
    });

    if (ordersToComplete.length > 0) {
      for (const order of ordersToComplete) {
        // 1. Tìm transaction pending của order này để chuyển tiền
        const pendingTransaction = await Transaction.findOne({
          where: {
            order_id: order.id,
            transaction_type: 'order_payment',
            status: 'pending'
          },
          transaction: dbTransaction
        });

        if (pendingTransaction && pendingTransaction.to_wallet_id) {
          // 2. Chuyển tiền từ customer đã trừ sang shop wallet với phí 5%
          const totalAmount = parseFloat(pendingTransaction.amount);
          const feePercentage = 0.05; // 5%
          const adminFee = totalAmount * feePercentage;
          const shopAmount = totalAmount - adminFee;

          // Lấy shop wallet và admin wallet
          const [shopWallet, adminWallet] = await Promise.all([
            Wallet.findByPk(pendingTransaction.to_wallet_id, { transaction: dbTransaction }),
            Wallet.findOne({ where: { user_id: 1 }, transaction: dbTransaction })
          ]);

          if (shopWallet && adminWallet) {
            // Cập nhật shop wallet balance (95% của số tiền)
            const currentShopBalance = parseFloat(shopWallet.balance);
            const newShopBalance = currentShopBalance + shopAmount;

            await Wallet.update(
              {
                balance: newShopBalance,
                updated_at: new Date()
              },
              {
                where: { id: pendingTransaction.to_wallet_id },
                transaction: dbTransaction
              }
            );

            // Cập nhật admin wallet balance (5% phí)
            const currentAdminBalance = parseFloat(adminWallet.balance);
            const newAdminBalance = currentAdminBalance + adminFee;

            await Wallet.update(
              {
                balance: newAdminBalance,
                updated_at: new Date()
              },
              {
                where: { id: adminWallet.id },
                transaction: dbTransaction
              }
            );

            // 3. Cập nhật transaction gốc thành completed
            await Transaction.update(
              {
                status: 'completed',
                description: `Payment transferred to shop for completed order #${order.id}`
              },
              {
                where: { id: pendingTransaction.id },
                transaction: dbTransaction
              }
            );

            console.log(` Order #${order.id}: Transferred ${shopAmount} VND to shop, ${adminFee} VND admin fee (total: ${totalAmount} VND)`);
          } else {
            if (!shopWallet) {
              console.warn(` Shop wallet ${pendingTransaction.to_wallet_id} not found for order #${order.id}`);
            }
            if (!adminWallet) {
              console.warn(` Admin wallet (user_id: 1) not found for order #${order.id}`);
            }
          }
        } else {
          console.warn(` Pending transaction not found or missing to_wallet_id for order #${order.id}`);
        }
      }

      // 4. Cập nhật tất cả orders thành completed
      await CakeOrder.update(
        { status: 'completed' },
        {
          where: {
            id: {
              [Op.in]: ordersToComplete.map(order => order.id)
            }
          },
          transaction: dbTransaction
        }
      );

      await dbTransaction.commit();
      console.log(` Auto-completed ${ordersToComplete.length} shipped orders and transferred payments`);
    } else {
      await dbTransaction.commit();
    }
  } catch (error) {
    await dbTransaction.rollback();
    console.error(' Error in auto-complete scheduler:', error);
  }
}, {
  scheduled: false
});

// ====== AUTO UPDATE CHALLENGE STATUS ======
const autoUpdateChallengeStatus = cron.schedule('0 7 * * *', async () => {
  try {
    console.log('=== Auto updating challenge statuses ===');
    const now = new Date();

    // 1. notStart -> onGoing / unAvailable
    const challengesToStart = await Challenge.findAll({
      where: {
        status: 'notStart',
        start_date: { [Op.lte]: now }
      }
    });

    for (const challenge of challengesToStart) {
      const entryCount = await ChallengeEntry.count({
        where: { challenge_id: challenge.id }
      });

      if (
        challenge.min_participants !== null &&
        entryCount < challenge.min_participants
      ) {
        await Challenge.update(
          { status: 'unAvailable' },
          { where: { id: challenge.id } }
        );
        console.log(`Challenge #${challenge.id} → unAvailable (participants: ${entryCount}/${challenge.min_participants})`);
      } else {
        await Challenge.update(
          { status: 'onGoing' },
          { where: { id: challenge.id } }
        );
        console.log(`Challenge #${challenge.id} → onGoing`);
      }
    }

    // 2. onGoing -> ended
    const challengesToEnd = await Challenge.findAll({
      where: {
        status: 'onGoing',
        end_date: { [Op.lte]: now }
      }
    });

    if (challengesToEnd.length > 0) {
      await Challenge.update(
        { status: 'ended' },
        { where: { id: { [Op.in]: challengesToEnd.map(c => c.id) } } }
      );
      console.log(`Ended ${challengesToEnd.length} challenges`);
    }

    console.log('=== Challenge status update complete ===');
  } catch (err) {
    console.error('Error updating challenge statuses:', err);
  }
}, { scheduled: false });

export { autoConfirmPendingOrders, autoCompleteShippedOrders, autoUpdateChallengeStatus };