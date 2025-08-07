import cron from 'node-cron';
import CakeOrder from '../models/cake_order.model.js';
import Wallet from '../models/wallet.model.js';
import Transaction from '../models/transaction.model.js';
import sequelize from '../database/db.js';
import { Op } from 'sequelize';

// Tự động chuyển đơn hàng từ 'pending' sang 'ordered' sau 5 phút
const autoConfirmPendingOrders = cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Checking for pending orders to auto-confirm...');

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 phút trước

    const pendingOrders = await CakeOrder.findAll({
      where: {
        status: 'pending',
        created_at: {
          [Op.lte]: fiveMinutesAgo
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
          // 2. Chuyển tiền từ customer đã trừ sang shop wallet
          const transferAmount = parseFloat(pendingTransaction.amount);

          // Lấy shop wallet và cập nhật balance
          const shopWallet = await Wallet.findByPk(pendingTransaction.to_wallet_id, {
            transaction: dbTransaction
          });

          if (shopWallet) {
            const currentShopBalance = parseFloat(shopWallet.balance);
            const newShopBalance = currentShopBalance + transferAmount;

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

            // 3. Cập nhật transaction status thành completed
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

            console.log(`💰 Transferred ${transferAmount} VND to shop for order #${order.id}`);
          } else {
            console.warn(`⚠️ Shop wallet ${pendingTransaction.to_wallet_id} not found for order #${order.id}`);
          }
        } else {
          console.warn(`⚠️ Pending transaction not found or missing to_wallet_id for order #${order.id}`);
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
      console.log(`✅ Auto-completed ${ordersToComplete.length} shipped orders and transferred payments`);
    } else {
      await dbTransaction.commit();
    }
  } catch (error) {
    await dbTransaction.rollback();
    console.error('❌ Error in auto-complete scheduler:', error);
  }
}, {
  scheduled: false
});

export { autoConfirmPendingOrders, autoCompleteShippedOrders };