import {
  createOrderService,
  getOrderByIdService,
  getOrdersByUserService,
  updateOrderStatusService,
} from "../services/order.service.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validators.js";

// Tahap ke 1
export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const payload = req.body;

    const orderData = await createOrderSchema.validateAsync(payload);

    const newOrder = await createOrderService(userId, orderData);

    res.status(201).json({
      status: "success",
      message: "Order created successfully",
      data: newOrder,
    });
  } catch (error) {
    const isCuponError = error.message.toLowerCase().includes("cupon");
    const statusCode = error.isJoi || isCuponError ? 400 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};

// Tahap ke 2
export const getMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await getOrdersByUserService(userId);

    res.status(200).json({
      status: "success",
      message: "Order fetched successfully",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const order = await getOrderByIdService(id, user);

    res.status(200).json({
      status: "success",
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Order not found") statusCode = 404;
    if (error.message === "Forbidden") statusCode = 403;
    res.status(statusCode).json({ status: "error", message: error.message });
  }
};

// Tahap ke 3
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const { status } = await updateOrderStatusSchema.validateAsync(payload);

    const updatedOrder = await updateOrderStatusService(id, status);

    res.status(200).json({
      status: "success",
      message: "Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    const statusCode = error.isJoi
      ? 400
      : error.message === "Order not found"
      ? 404
      : 500;
    res.status(statusCode).json({ status: "error", message: error.message });
  }
};
