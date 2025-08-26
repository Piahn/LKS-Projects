import { prisma } from "../utils/prisma.js";

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
