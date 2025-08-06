import cron from 'node-cron';
import CakeOrder from '../models/cake_order.model.js';
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

// Tự động chuyển đơn hàng từ 'shipped' sang 'completed' sau 2 tiếng
const autoCompleteShippedOrders = cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('Checking for shipped orders to auto-complete...');

    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 tiếng trước

    const ordersToComplete = await CakeOrder.findAll({
      where: {
        status: 'shipped',
        updated_at: {
          [Op.lte]: twoHoursAgo
        }
      }
    });

    if (ordersToComplete.length > 0) {
      await CakeOrder.update(
        { status: 'completed' },
        {
          where: {
            id: {
              [Op.in]: ordersToComplete.map(order => order.id)
            }
          }
        }
      );

      console.log(`Auto-completed ${ordersToComplete.length} shipped orders`);
    }
  } catch (error) {
    console.error('Error in auto-complete scheduler:', error);
  }
}, {
  scheduled: false
});

export { autoConfirmPendingOrders, autoCompleteShippedOrders };