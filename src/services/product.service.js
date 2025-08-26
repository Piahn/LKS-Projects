import { prisma } from "../utils/prisma.js";

export const getAllProductsService = async () => {
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });
  return products;
};

export const getProductByIdService = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

export const createProductService = async (payload) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
    select: {
      id: true,
      name: true,
      productCount: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const newProduct = await prisma.product.create({
    data: {
      name: payload.name,
      price: payload.price,
      categoryId: payload.categoryId,
      imageUrl: payload.imageUrl,
    },
  });

  await prisma.category.update({
    where: { id: category.id },
    data: {
      productCount: category.productCount + 1,
    },
  });

  return newProduct;
};

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

  if (payload.categoryId) {
    dataToUpdate.category = {
      connect: {
        id: payload.categoryId,
      },
    };
    delete dataToUpdate.categoryId;
  }

  const updatedProduct = await prisma.product.update({
    where: { id: productId },
    data: dataToUpdate,
  });

  return updatedProduct;
};

export const deleteProductService = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: {
        select: {
          id: true,
          productCount: true,
        },
      },
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await prisma.category.update({
    where: { id: product.category.id },
    data: {
      productCount: product.category.productCount - 1,
    },
  });

  await prisma.product.delete({
    where: { id: productId },
  });
};
