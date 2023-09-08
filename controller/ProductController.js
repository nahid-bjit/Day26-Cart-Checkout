const { validationResult } = require("express-validator");
const HTTP_STATUS = require("../constants/statusCodes");
const ProductModel = require("../model/Product");
const { success, failure } = require("../util/common");

class Product {

    // ## total object count, Page, Limit, Sort, Sort by param, Search, Search by single brand & Multiple brand, default page while no query params ##

    async getAll(req, res) {
        try {
            let { page, limit, sortParam, sortOrder, search, brand } = req.query;

            // Pagination
            const parsedPage = parseInt(page) || 1;
            const parsedLimit = parseInt(limit) || 20;

            if (parsedPage < 1 || parsedLimit < 0) {
                return res
                    .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
                    .send(failure("Page and limit values must be at least 1"));
            }

            // Order - Asc and Desc part
            const validSortOrders = ['asc', 'desc'];
            if (sortOrder && !validSortOrders.includes(sortOrder)) {
                return res
                    .status(HTTP_STATUS.BAD_REQUEST)
                    .send(failure("Invalid input parameter for sortOrder"));
            }

            // sortParam and sortOrder
            let sortObj = {};
            if (sortParam === 'price') {
                sortObj = { price: sortOrder === 'asc' ? 1 : -1 };
            } else if (sortParam === 'stock') {
                sortObj = { stock: sortOrder === 'asc' ? 1 : -1 };
            }

            // Search
            const searchQuery = search && {
                $or: [
                    { name: { $regex: new RegExp(search, 'i') } },
                    { description: { $regex: new RegExp(search, 'i') } }
                ]
            };

            // Multiple brand
            const brandArray = brand ? brand.split(',') : [];
            const brandQuery = brandArray.length > 0 && {
                brand: { $in: brandArray.map(value => new RegExp(value, 'i')) }
            };

            // Combine sorting, search, and brand filter queries
            const query = {
                ...searchQuery,
                ...brandQuery
            };

            const totalCount = await ProductModel.countDocuments();
            const skipCount = (parsedPage - 1) * parsedLimit;
            const adjustedLimit = totalCount < parsedLimit ? totalCount : parsedLimit;

            // The combined query
            const allProducts = await ProductModel.find(query)
                .skip(skipCount)
                .limit(adjustedLimit)
                .sort(sortObj);

            if (allProducts.length === 0) {
                return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
            }

            return res
                .status(HTTP_STATUS.OK)
                .send(
                    success("Successfully got all products", {
                        total: totalCount,
                        countPerPage: allProducts.length,
                        products: allProducts,
                    })
                );

        } catch (error) {
            console.error(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error"));
        }
    }


    // ## Page, Limit, Sort, Sort by param, Search, Search by single brand & Multiple brand, default page while no query params ##

    // async getAll(req, res) {
    //     try {
    //         let { page, limit, sortParam, sortOrder, search, brand } = req.query;

    //         // Set default values for page and limit if not provided
    //         const parsedPage = parseInt(page) || 1; // Default to page 1
    //         const parsedLimit = parseInt(limit) || 20; // Default to a limit of 20

    //         // Determine if any query parameters are provided
    //         const hasQueryParameters = sortParam || sortOrder || search || brand;

    //         const skipCount = (parsedPage - 1) * parsedLimit;

    //         if (page < 1 || limit < 0) {
    //             return res
    //                 .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //                 .send(failure("Page and limit values must be at least 1"));
    //         }

    //         // Default sortOrder to 'asc' if not provided or invalid
    //         const validSortOrders = ['asc', 'desc'];
    //         if (sortOrder && !validSortOrders.includes(sortOrder)) {
    //             return res
    //                 .status(HTTP_STATUS.BAD_REQUEST)
    //                 .send(failure("Invalid input parameter for sortOrder"));
    //         }

    //         //   const skipCount = (page - 1) * limit;

    //         // Construct the sorting object based on sortParam and sortOrder
    //         let sortObj = {};
    //         if (sortParam === 'price') {
    //             sortObj = { price: sortOrder === 'asc' ? 1 : -1 };
    //         } else if (sortParam === 'stock') {
    //             sortObj = { stock: sortOrder === 'asc' ? 1 : -1 };
    //         }
    //         // Construct the search query if a search is provided
    //         const searchQuery = search && {
    //             $or: [
    //                 { name: { $regex: new RegExp(search, 'i') } }, // Case-insensitive search in 'name'
    //                 { description: { $regex: new RegExp(search, 'i') } } // Case-insensitive search in 'description'
    //             ]
    //         };

    //         // Construct the brand filter query if a brand is provided
    //         const brandQuery = brand && {
    //             brand: { $regex: new RegExp(brand, 'i') } // Case-insensitive search in 'brand'
    //         };

    //         // Combine sorting, search, and brand filter queries
    //         const query = {
    //             ...searchQuery,
    //             ...brandQuery
    //         };

    //         // Adjust the limit based on query parameters
    //         const adjustedLimit = hasQueryParameters ? 0 : parsedLimit;

    //         const allProducts = await ProductModel.find(query)
    //             .skip(skipCount)
    //             .limit(adjustedLimit) // Use adjusted limit
    //             .sort(sortObj);

    //         if (allProducts.length === 0) {
    //             return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
    //         }

    //         return res
    //             .status(HTTP_STATUS.OK)
    //             .send(
    //                 success("Successfully got all products", {
    //                     countPerPage: allProducts.length,
    //                     products: allProducts,
    //                 })
    //             );
    //     } catch (error) {
    //         console.error(error);
    //         return res
    //             .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //             .send(failure("Internal server error"));
    //     }
    // }


    // ## Page, Limit, Sort, Sort by param, Search, Search by single brand & Multiple brand ##

    // async getAll(req, res) {
    //     try {
    //         const { page, limit, sortParam, sortOrder, search, brand } = req.query;
    //         if (page < 1 || limit < 0) {
    //             return res
    //                 .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //                 .send(failure("Page and limit values must be at least 1"));
    //         }

    //         // Default sortOrder to 'asc' if not provided or invalid
    //         const validSortOrders = ['asc', 'desc'];
    //         if (sortOrder && !validSortOrders.includes(sortOrder)) {
    //             return res
    //                 .status(HTTP_STATUS.BAD_REQUEST)
    //                 .send(failure("Invalid input parameter for sortOrder"));
    //         }

    //         const skipCount = (page - 1) * limit;

    //         // Construct the sorting object based on sortParam and sortOrder
    //         let sortObj = {};
    //         if (sortParam === 'price') {
    //             sortObj = { price: sortOrder === 'asc' ? 1 : -1 };
    //         } else if (sortParam === 'stock') {
    //             sortObj = { stock: sortOrder === 'asc' ? 1 : -1 };
    //         }

    //         // Construct the search query if a search is provided
    //         const searchQuery = search && {
    //             $or: [
    //                 { name: { $regex: new RegExp(search, 'i') } }, // Case-insensitive search in 'name'
    //                 { description: { $regex: new RegExp(search, 'i') } } // Case-insensitive search in 'description'
    //             ]
    //         };

    //         // Construct the brand filter query if a brand is provided
    //         const brandQuery = brand && {
    //             brand: { $regex: new RegExp(brand, 'i') } // Case-insensitive search in 'brand'
    //         };

    //         // Combine sorting, search, and brand filter queries
    //         const query = {
    //             ...searchQuery,
    //             ...brandQuery
    //         };

    //         const allProducts = await ProductModel.find(query)
    //             .skip(skipCount)
    //             .limit(limit)
    //             .sort(sortObj);

    //         if (allProducts.length === 0) {
    //             return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
    //         }

    //         return res
    //             .status(HTTP_STATUS.OK)
    //             .send(
    //                 success("Successfully got all products", {
    //                     countPerPage: allProducts.length,
    //                     products: allProducts,
    //                 })
    //             );
    //     } catch (error) {
    //         console.error(error);
    //         return res
    //             .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //             .send(failure("Internal server error"));
    //     }
    // }


    // ## Page, Limit, Sort, Search, Search by single brand & Multiple brand ##

    // async getAll(req, res) {
    //     try {
    //         const { page, limit, sortOrder, search, brand } = req.query;
    //         if (page < 1 || limit < 0) {
    //             return res
    //                 .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //                 .send(failure("Page and limit values must be at least 1"));
    //         }

    //         // Default sortOrder to 'asc' if not provided or invalid
    //         const validSortOrders = ['asc', 'desc'];
    //         if (sortOrder && !validSortOrders.includes(sortOrder)) {
    //             return res
    //                 .status(HTTP_STATUS.BAD_REQUEST)
    //                 .send(failure("Invalid input parameter for sortOrder"));
    //         }

    //         const skipCount = (page - 1) * limit;

    //         // Construct the sorting object based on sortOrder
    //         const sortObj = sortOrder && {
    //             price: sortOrder === 'asc' ? 1 : -1
    //         };

    //         // Construct the search query if a search is provided
    //         const searchQuery = search && {
    //             $or: [
    //                 { name: { $regex: new RegExp(search, 'i') } }, // Case-insensitive search in 'name'
    //                 { description: { $regex: new RegExp(search, 'i') } } // Case-insensitive search in 'description'
    //             ]
    //         };

    //         // Split the brand parameter into an array of brand names
    //         const brandNames = brand ? brand.split(",") : [];

    //         // Construct the brand filter query if brandNames is not empty
    //         const brandQuery = brandNames.length > 0 && {
    //             brand: { $in: brandNames.map(name => new RegExp(name, 'i')) } // Case-insensitive search for each brand name
    //         };

    //         // Combine sorting, search, and brand filter queries
    //         const query = {
    //             ...searchQuery,
    //             ...brandQuery
    //         };

    //         const allProducts = await ProductModel.find(query)
    //             .skip(skipCount)
    //             .limit(limit)
    //             .sort(sortObj);

    //         if (allProducts.length === 0) {
    //             return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
    //         }

    //         return res
    //             .status(HTTP_STATUS.OK)
    //             .send(
    //                 success("Successfully got all products", {
    //                     countPerPage: allProducts.length,
    //                     products: allProducts,
    //                 })
    //             );
    //     } catch (error) {
    //         console.error(error);
    //         return res
    //             .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //             .send(failure("Internal server error"));
    //     }
    // }




    // ## Page, Limit, Sort, Search, Search by single brand name ##

    // async getAll(req, res) {
    //     try {
    //         const { page, limit, sortOrder, search, brand } = req.query;
    //         if (page < 1 || limit < 0) {
    //             return res
    //                 .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //                 .send(failure("Page and limit values must be at least 1"));
    //         }

    //         // Default sortOrder to 'asc' if not provided or invalid
    //         const validSortOrders = ['asc', 'desc'];
    //         if (sortOrder && !validSortOrders.includes(sortOrder)) {
    //             return res
    //                 .status(HTTP_STATUS.BAD_REQUEST)
    //                 .send(failure("Invalid input parameter for sortOrder"));
    //         }

    //         const skipCount = (page - 1) * limit;

    //         // Construct the sorting object based on sortOrder
    //         const sortObj = sortOrder && {
    //             price: sortOrder === 'asc' ? 1 : -1
    //         };

    //         // Construct the search query if a search is provided
    //         const searchQuery = search && {
    //             $or: [
    //                 { name: { $regex: new RegExp(search, 'i') } }, // Case-insensitive search in 'name'
    //                 { description: { $regex: new RegExp(search, 'i') } } // Case-insensitive search in 'description'
    //             ]
    //         };

    //         // Construct the brand filter query if a brand is provided
    //         const brandQuery = brand && {
    //             brand: { $regex: new RegExp(brand, 'i') } // Case-insensitive search in 'brand'
    //         };

    //         // Combine sorting, search, and brand filter queries
    //         const query = {
    //             ...searchQuery,
    //             ...brandQuery
    //         };

    //         const allProducts = await ProductModel.find(query)
    //             .skip(skipCount)
    //             .limit(limit)
    //             .sort(sortObj);

    //         if (allProducts.length === 0) {
    //             return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
    //         }

    //         return res
    //             .status(HTTP_STATUS.OK)
    //             .send(
    //                 success("Successfully got all products", {
    //                     countPerPage: allProducts.length,
    //                     products: allProducts,
    //                 })
    //             );
    //     } catch (error) {
    //         console.error(error);
    //         return res
    //             .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //             .send(failure("Internal server error"));
    //     }
    // }




    // ## Page and Limit ## 
    // async getAll(req, res) {
    //     try {
    //         const { page, limit } = req.query;
    //         if (page < 1 || limit < 0) {
    //             return res
    //                 .status(HTTP_STATUS.UNPROCESSABLE_ENTITY)
    //                 .send(failure("Page and limit values must be at least 1"));
    //         }
    //         const allProducts = await ProductModel.find({})
    //             .skip((page - 1) * limit)
    //             .limit(limit);
    //         if (allProducts.length === 0) {
    //             return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
    //         }
    //         return res
    //             .status(HTTP_STATUS.OK)
    //             .send(
    //                 success("Successfully got all products", {
    //                     countPerPage: allProducts.length,
    //                     products: allProducts,
    //                 })
    //             );
    //     } catch (error) {
    //         console.log(error);
    //         return res
    //             .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //             .send(failure("Internal server error"));
    //     }
    // }

    // ## previous working state ##
    // async getAll(req, res) {
    //     try {
    //         const allProducts = await ProductModel.find({}).sort({ createdAt: -1 });
    //         if (allProducts.length === 0) {
    //             return res.status(HTTP_STATUS.NOT_FOUND).send(failure("No products were found"));
    //         }
    //         return res
    //             .status(HTTP_STATUS.OK)
    //             .send(
    //                 success("Successfully got all products", {
    //                     products: allProducts,
    //                     total: allProducts.length,
    //                 })
    //             );
    //     } catch (error) {
    //         console.log(error);
    //         return res
    //             .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
    //             .send(failure("Internal server error"));
    //     }
    // }

    async create(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(failure("Failed to add the product", validation));
            }
            const { title, description, price, stock, brand } = req.body;

            const existingProduct = await ProductModel.findOne({ title: title });

            if (existingProduct) {
                return res
                    .status(HTTP_STATUS.NOT_FOUND)
                    .send(failure("Product with same title already exists"));
            }

            const newProduct = await ProductModel.create({
                title: title,
                description: description,
                price: price,
                stock: stock,
                brand: brand,
            });
            console.log(newProduct);
            if (newProduct) {
                return res
                    .status(HTTP_STATUS.OK)
                    .send(success("Successfully added product", newProduct));
            }
        } catch (error) {
            console.log(error);
            return res
                .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send(failure("Internal server error"));
        }
    }
}

module.exports = new Product();
