requirement Tools Backend:

```
npm install @prisma/client@6.14.0 bcrypt@6.0.0 body-parser@2.2.0 cors@2.8.5 dotenv@17.2.1 express@5.1.0 joi@18.0.0 jsonwebtoken@9.0.2 nanoid@5.1.5
```

-Dev

```
npm install --save-dev nodemon@3.1.10 prisma@6.14.0
```

---

# src/service/order.service.js

```

import { prisma } from "../utils/db.js";

export const createOrderService = async (userId, payload) => {
  const { items, couponCode } = payload;

  const productIds = items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  let jumlah_diskon = 0;
  let couponId = null;

  let subtotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    subtotal += product.price * item.quantity;
  }

  // Perbaruan data coupons
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: {
        code: couponCode,
      },
    });

    if (!coupon) throw new Error("Coupon code is not valid");

    if (coupon.expiration < new Date().toDateString()) {
      await prisma.coupon.update({
        where: {
          id: coupon.id,
        },
        data: {
          is_active: false,
        },
      });
    }

    if (!coupon.is_active) throw new Error("This coupon is no longer active.");
    if (coupon.userId !== userId) {
      throw new Error("This coupon is not valid for this users");
    }

    if (coupon.jenis_diskon === "nominal") {
      jumlah_diskon = coupon.nilai_diskon;
    } else if (coupon.jenis_diskon === "persentase") {
      jumlah_diskon = subtotal * (coupon.nilai_diskon / 100);
    }

    couponId = coupon.id;

    await prisma.coupon.update({
      where: {
        id: coupon.id,
      },
      data: {
        is_active: false,
      },
    });
  }

  const tax = subtotal * 0.1; // pajak 10%
  const grandTotal = subtotal + tax - jumlah_diskon;

  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        subtotal,
        tax,
        grandTotal,
        couponId: couponId,
      },
    });

    const orderItemsData = items.map((item) => {
      const product = products.find((p) => p.id == item.productId);

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

export const getOrdersByUserService = async (userId) => {
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
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOrdersByIdService = async (orderId, user) => {
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

export const updateOrderStatusService = async (orderId, statusData) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) throw new Error("Order not found");

  return await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: statusData,
      paidAt:
        statusData === "paid" || statusData === "completed" ? new Date() : null,
    },
  });
};
```

# src/service/order.controller.js

```
import {
  createOrderService,
  getOrdersByIdService,
  getOrdersByUserService,
  updateOrderStatusService,
} from "../service/order.service.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator.js";

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
    const isCuponError = error.message.toLowerCase().includes("coupon");
    const statusCode = error.isJoi || isCuponError ? 400 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await getOrdersByUserService(userId);

    if (orders.length === 0) {
      return res.status(404).json({
        status: "success",
        message: "No order found",
      });
    }

    res.status(200).json({
      status: "suceess",
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

    const order = await getOrdersByIdService(id, user);

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

```

# src/service/dashboard.service.js

```
import { prisma } from "../utils/db.js";

export const getDashboardStatsService = async () => {
  const totalRevenueResult = await prisma.order.aggregate({
    _sum: {
      grandTotal: true,
    },
    where: {
      status: "completed",
    },
  });

  const totalRevenue = totalRevenueResult._sum.grandTotal || 0;

  // Menghitung jumlah total pengguna
  const totalUsers = await prisma.user.count();

  // Menghitung jumlah total product
  const totalProducts = await prisma.product.count();

  // Menghitung jumlah pesanan baru
  const newOrders = await prisma.order.count({
    where: {
      status: {
        in: ["paid", "processing", "pending", "shipped"],
      },
    },
  });

  // Mengambil 5 pesanan terbaru
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    totalRevenue,
    totalUsers,
    totalProducts,
    newOrders,
    recentOrders,
  };
};

```

# src/service/auth.middleware.js

```
import jwt from "jsonwebtoken";
import { prisma } from "../utils/db.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User Not Found",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verifikasi Token
    const secret = process.env.JWT_SECRET;
    const decode = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: {
        id: decode.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: User Not Found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized: Invalid Token",
      error: error.message,
    });
  }
};

export const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message:
          "Forbidden: You do not have permission to access this resource",
      });
    }
    next();
  };
};

```

# src/service/product.service.js

```
export const updateProductService = async (productId, payload) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const dataToUpdate = { ...payload };

  if (!payload.categoryId) throw new Error("Category not found");

  if (payload.categoryId) {
    dataToUpdate.category = {
      connect: {
        id: payload.categoryId,
      },
    };
    delete dataToUpdate.categoryId;
  }

  const updateProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: dataToUpdate,
  });

  return updateProduct;
};
```
