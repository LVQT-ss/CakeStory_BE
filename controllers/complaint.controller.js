import Complaint from "../models/complaint.model.js";
import CakeOrder from "../models/cake_order.model.js";
import Wallet from "../models/wallet.model.js";
import Transaction from "../models/transaction.model.js";
import sequelize from "../database/db.js";
import User from "../models/User.model.js";
import Shop from "../models/shop.model.js";
import Post from "../models/post.model.js";
import PostData from "../models/post_data.model.js";
import MarketplacePost from "../models/marketplace_post.model.js";
export const createComplaint = async (req, res) => {
  try {
    const { order_id, reason, evidence_images } = req.body;

    // Kiểm tra order tồn tại và thuộc về user hiện tại
    const order = await CakeOrder.findOne({
      where: { id: order_id, customer_id: req.userId }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or not yours" });
    }

    const now = new Date();

    if (["ordered", "prepared"].includes(order.status)) {
      if (!order.delivery_time) {
        return res.status(400).json({ 
          message: "This order has no delivery_time set, cannot file complaint" 
        });
      }

      const deliveryTime = new Date(order.delivery_time);

      if (now < deliveryTime) {
        return res.status(400).json({ 
          message: "You can only file a complaint after the delivery time has passed" 
        });
      }

      // Nếu hợp lệ thì cập nhật sang complaining
      await order.update({ status: "complaining" });

    } else if (order.status === "shipped") {
      // shipped thì cho complain luôn
      await order.update({ status: "complaining" });
    } else {
      return res.status(400).json({ 
        message: "Complaint can only be created for orders that are ordered, prepared, or shipped" 
      });
    }

    // Tạo complaint
    const complaint = await Complaint.create({
      order_id,
      user_id: req.userId,
      reason,
      evidence_images,
      status: "pending",
      admin_note: null,
      processed_at: null,
      processed_by: null
    });

    return res.status(201).json(complaint);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Cập nhật complaint (admin note + processed info)
 */
export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_note } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Cập nhật admin note và processed info
    await complaint.update({
      admin_note,
      processed_at: new Date(),
      processed_by: req.userId
    });

    return res.json(complaint);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Duyệt complaint (approved → order cancelled + refund to customer)
 */
export const approveComplaint = async (req, res) => {
  const dbTransaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id, { transaction: dbTransaction });
    if (!complaint) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: "Complaint not found" });
    }

    const order = await CakeOrder.findByPk(complaint.order_id, { transaction: dbTransaction });
    if (!order) {
      await dbTransaction.rollback();
      return res.status(404).json({ message: "Related order not found" });
    }

    // Check if complaint is already processed
    if (complaint.status !== 'pending') {
      await dbTransaction.rollback();
      return res.status(400).json({ message: "Complaint has already been processed" });
    }

    // Find the original payment transaction for this order
    const originalPayment = await Transaction.findOne({
      where: {
        order_id: order.id,
        transaction_type: 'order_payment',
        status: 'pending' // Find the pending transaction that holds the money
      },
      transaction: dbTransaction
    });

    if (!originalPayment) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: "Original payment transaction not found for this order"
      });
    }

    // Find customer's wallet to refund the money
    const customerWallet = await Wallet.findOne({
      where: { user_id: order.customer_id },
      transaction: dbTransaction
    });

    if (!customerWallet) {
      await dbTransaction.rollback();
      return res.status(404).json({
        message: "Customer wallet not found"
      });
    }

    // Process refund to customer wallet
    const refundAmount = parseFloat(order.total_price);
    const currentBalance = parseFloat(customerWallet.balance);
    const newBalance = currentBalance + refundAmount;

    await Wallet.update(
      {
        balance: newBalance,
        updated_at: new Date()
      },
      {
        where: { user_id: order.customer_id },
        transaction: dbTransaction
      }
    );

    // Update the original transaction to mark it as cancelled (refunded)
    await Transaction.update(
      {
        transaction_type: 'order_payment',
        status: 'failed',
        description: `Refunded payment for approved complaint on cake order #${order.id}`
      },
      {
        where: { id: originalPayment.id },
        transaction: dbTransaction
      }
    );

    // Update complaint status to approved
    await complaint.update({
      status: "approved",
      processed_at: new Date(),
      processed_by: req.userId
    }, { transaction: dbTransaction });

    // Update order status to cancelled
    await order.update({ status: "cancelled" }, { transaction: dbTransaction });

    await dbTransaction.commit();

    return res.status(200).json({
      message: "Complaint approved, order cancelled, and refund processed successfully",
      complaint: {
        id: complaint.id,
        status: complaint.status,
        processed_at: complaint.processed_at,
        processed_by: complaint.processed_by
      },
      order: {
        id: order.id,
        status: order.status
      },
      refund: {
        transaction_id: originalPayment.id,
        refund_amount: refundAmount,
        customer_id: order.customer_id,
        previous_balance: currentBalance,
        new_balance: newBalance
      }
    });

  } catch (error) {
    await dbTransaction.rollback();
    console.error('approveComplaint error:', error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    if (complaint.status !== 'pending') {
      return res.status(400).json({ message: "Complaint has already been processed" });
    }

    const order = await CakeOrder.findByPk(complaint.order_id);
    if (!order) {
      return res.status(404).json({ message: "Related order not found" });
    }

    await complaint.update({
      status: "rejected",
      processed_at: new Date(),
      processed_by: req.userId
    });

    await order.update({ status: "completed" });

    return res.json({ complaint, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all complaints by shop_id
 */
export const getComplaintsByShopId = async (req, res) => {
  try {
    const { shop_id } = req.params;

    // Nếu không phải admin/staff thì kiểm tra quyền sở hữu shop
    if (req.role !== "admin" && req.role !== "staff") {
      const shop = await Shop.findByPk(shop_id);

      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }

      if (shop.user_id !== req.userId) {
        return res.status(403).json({ message: "Not authorized to view complaints of this shop" });
      }
    }

    // Lấy complaint theo shop_id
    const complaints = await Complaint.findAll({
      include: [
        {
          model: CakeOrder,
          as: "order",
          where: { shop_id },
          include: [
            {
              model: User,
              attributes: ["id", "username", "full_name", "email", "address", "phone_number"],
            },
          ],
        },
      ],
    });

    return res.json(complaints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all complaints by customer_id
 */
export const getComplaintsByCustomerId = async (req, res) => {
  try {
    const { customer_id } = req.params;

    // Nếu là user thường thì chỉ cho phép xem của chính họ
    if (req.role !== "admin" && req.role !== "staff") {
      if (parseInt(customer_id) !== req.userId) {
        return res.status(403).json({ message: "Not authorized to view complaints of this customer" });
      }
    }

    const complaints = await Complaint.findAll({
      include: [
        {
          model: CakeOrder,
          as: "order",
          where: { customer_id },
          include: [
            {
              model: User,
              attributes: ["id", "username", "full_name", "email", "address", "phone_number"],
            },
          ],
        },
      ],
    });

    return res.json(complaints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
/**
 * Get all complaints
 */
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.findAll({
      include: [
        {
          model: CakeOrder,
          as: 'order',
          include: [
            {
              model: User,
              attributes: ['id', 'username','full_name','email', 'address', 'phone_number']
            }
          ]
        }
      ]
    });

    return res.json(complaints);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get complaint by ID with order details
 */
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id, {
      include: [
        {
          model: CakeOrder,
          as: "order",
          attributes: ["id", "customer_id", "shop_id", "total_price", "status", "created_at", "special_instructions", "tier", "delivery_time", "shipped_at"],
          include: [
            {
              model: User,
              attributes: ["id", "username", "full_name", "email", "address", "phone_number"],
            },
            {
              model: Shop,
              attributes: ["shop_id", "user_id", "business_name"],
            },
            {
              model: MarketplacePost,
              attributes: ["post_id", "shop_id"],
              include: [
                {
                  model: Post,
                  as: "post",
                  attributes: ["id", "title", "description"],
                  include: [
                    {
                      model: PostData,
                      as: "media",
                      attributes: ["id", "image_url", "video_url"], 
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Kiểm tra quyền
    if (req.role !== "admin" && req.role !== "staff") {
      const order = complaint.order;

      const isCustomer = order.customer_id === req.userId;
      const isShopOwner = order.shop && order.shop.user_id === req.userId;

      if (!isCustomer && !isShopOwner) {
        return res.status(403).json({ message: "Not authorized to view this complaint" });
      }
    }

    return res.json(complaint);
  } catch (error) {
    console.error("getComplaintById error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};