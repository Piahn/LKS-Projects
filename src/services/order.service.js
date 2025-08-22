import { prisma } from "../utils/prisma.js";

// Tahap 1
export const createOrderService = async (userId, items) => {
  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    subtotal += product.price * item.quantity;
  }

  const tax = subtotal * 0.1; // dengan pajak 10%
  const grandTotal = subtotal + tax;

  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        subtotal,
        tax,
        grandTotal,
      },
    });

    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      };
    });
    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    return order;
  });

  return createdOrder;
};

// Tahap ke 2
export const getOrdersByUserService = async (userId) => {
  return await prisma.order.findMany({
    where: {
      userId: userId,
    },
    include: {
      orderItem: {
        include: {
          product: {
            select: {
              name: true,
              imageUrl: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc", // menampilkan order terbaru
    },
  });
};

export const getOrderByIdService = async (orderId, user) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      orderItem: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (user.role !== "ADMIN" && order.userId !== user.id) {
    throw new Error("Forbidden");
  }

  return order;
};

// Tahap ke 3
export const updateOrderStatusService = async (orderId, statusData) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return await prisma.order.update({
    where: { id: orderId },
    data: {
      status: statusData,
      paidAt:
        statusData === "paid" || statusData === "completed" ? new Date() : null,
    },
  });
};
