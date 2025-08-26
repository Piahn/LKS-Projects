import { prisma } from "../utils/prisma.js";

// Tahap 1
export const createOrderService = async (userId, payload) => {
  const { items, couponCode } = payload;

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  // Coupons Data
  let jumlah_diskon = 0;
  let couponId = null;

  // Items data
  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    subtotal += product.price * item.quantity;
  }

  // Perbaruan data coupons (ketika ngecreate coupon)
  if (couponCode) {
    const coupon = await prisma.cupon.findUnique({
      where: {
        code: couponCode,
      },
    });

    if (!coupon) throw new Error("Cupon code is not valid.");

    if (coupon.expiration < new Date().toDateString()) {
      await prisma.cupon.update({
        where: {
          id: coupon.id,
        },
        data: {
          is_active: false,
        },
      });
    }

    if (!coupon.is_active) throw new Error("This cupon is no longer active.");
    if (coupon.userId !== userId) {
      throw new Error("This cupon is not valid for this user."); // <-- Keamanan Kunci!
    }

    if (coupon.jenis_diskon === "nominal") {
      jumlah_diskon = coupon.nilai_diskon;
    } else if (coupon.jenis_diskon === "persentase") {
      jumlah_diskon = subtotal * (coupon.nilai_diskon / 100);
    }

    couponId = coupon.id;

    // Nambahkan logic delete cupon setelah di pake
    await prisma.cupon.update({
      where: {
        id: coupon.id,
      },
      data: {
        is_active: false,
      },
    });
  }

  const tax = subtotal * 0.1; // dengan pajak 10%
  const grandTotal = subtotal + tax - jumlah_diskon;

  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        subtotal,
        tax,
        grandTotal,
        cuponId: couponId,
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
export const getOrdersByUserService = async (userId, skip, limit) => {
  return await prisma.order.findMany({
    where: {
      userId: userId,
      is_archived: false,
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
      Cupon: true,
    },
    skip: skip,
    take: limit,
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
