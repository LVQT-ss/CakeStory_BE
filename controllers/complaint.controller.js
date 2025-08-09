import Complaint from "../models/complaint.model.js";
import CakeOrder from "../models/cake_order.model.js";

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

    // Nếu status là "shipped" thì chuyển thành "complaining"
    if (order.status === "shipped") {
      await order.update({ status: "complaining" });
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
 * Duyệt complaint (approved → order cancelled)
 */
export const approveComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const order = await CakeOrder.findByPk(complaint.order_id);
    if (!order) {
      return res.status(404).json({ message: "Related order not found" });
    }

    await complaint.update({
      status: "approved",
      processed_at: new Date(),
      processed_by: req.userId
    });

    await order.update({ status: "cancelled" });

    return res.json({ complaint, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Từ chối complaint (rejected → order completed)
 */
export const rejectComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
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
