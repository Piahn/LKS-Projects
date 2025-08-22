import { prisma } from "../utils/prisma.js";

export const createCategoryService = async (payload) => {
  return await prisma.category.create({ data: payload });
};

export const getAllCategoriesService = async () => {
  return await prisma.category.findMany();
};

export const getCategoryByIdService = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

export const updateCategoryService = async (categoryId, payload) => {
  await getCategoryByIdService(categoryId);
  return await prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });
};

export const deleteCategoryService = async (categoryId) => {
  await getCategoryByIdService(categoryId);

  const productCount = await prisma.product.count({
    where: { categoryId: categoryId },
  });

  if (productCount > 0) {
    throw new Error("Cannot delete category with associated products.");
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });
};
