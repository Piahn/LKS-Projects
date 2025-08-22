import * as categoryService from "../services/category.service.js";
import { categorySchema } from "../validators/category.validators.js";

export const createCategory = async (req, res) => {
  try {
    const payload = req.body;

    const categoryData = await categorySchema.validateAsync(payload);

    const newCategory = await categoryService.createCategoryService(
      categoryData
    );

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategoriesService();

    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await categoryService.getCategoryByIdService(id);

    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    const updatedCategory = await categoryService.updateCategoryService(
      id,
      payload
    );

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    const statusCode = error.message === "Category not found" ? 404 : 500;
    res.status(statusCode).json({
      status: "error",
      message: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await categoryService.deleteCategoryService(id);

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    let statusCode = 500;
    if (error.message === "Category not found") statusCode = 404;
    if (error.message.includes("associated products")) statusCode = 400; // Bad Request
    res.status(statusCode).json({ status: "error", message: error.message });
  }
};
