const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');

class ProductService {
    static async getAllProducts(req, res) {
        const { category, search, minPrice, maxPrice, sort = '-createdAt' } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; // Increased default limit
        const skip = (page - 1) * limit;

        let query = {};
        
        if (category && category !== 'All') {
        query.category = category;
        }
        
        if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.name = { $regex: escapedSearch, $options: 'i' };
        }

        if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        const [products, total] = await Promise.all([
        Product.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query)
        ]);

        return {
        products,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
        };
    }

    static async getProductById(id) {
        const product = await Product.findById(id);
        
        if (!product) {
        throw { status: 404, message: 'Product not found' };
        }
        
        return product;
    }

    static async createProductReview(productId, userId, rating, comment) {
        const hasPurchased = await Order.findOne({
        user: userId,
        'items.product': productId,
        orderStatus: 'delivered'
        });

        if (!hasPurchased) {
        throw { status: 403, message: 'You must purchase and receive this product to review it.' };
        }

        const product = await Product.findById(productId);
        if (!product) {
        throw { status: 404, message: 'Product not found' };
        }

        const user = await User.findById(userId).select('name');

        const review = {
        user: userId,
        name: user.name,
        rating: Number(rating),
        comment
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        return { message: 'Review added successfully', product };
    }

    static async updateProductReview(productId, reviewId, userId, rating, comment) {
        const product = await Product.findById(productId);
        if (!product) {
        throw { status: 404, message: 'Product not found' };
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
        throw { status: 404, message: 'Review not found' };
        }

        if (review.user.toString() !== userId) {
        throw { status: 403, message: 'Not authorized to update this review' };
        }

        if (rating) review.rating = Number(rating);
        if (comment) review.comment = comment;

        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

        await product.save();
        return { message: 'Review updated successfully', product };
    }

    static async deleteProductReview(productId, reviewId, userId) {
        const product = await Product.findById(productId);
        if (!product) {
        throw { status: 404, message: 'Product not found' };
        }

        const review = product.reviews.id(reviewId);
        if (!review) {
        throw { status: 404, message: 'Review not found' };
        }

        if (review.user.toString() !== userId) {
        throw { status: 403, message: 'Not authorized to delete this review' };
        }

        product.reviews.pull(reviewId);

        product.numReviews = product.reviews.length;
        if (product.numReviews > 0) {
        product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
        } else {
        product.rating = 0;
        }

        await product.save();
        return { message: 'Review deleted successfully', product };
    }
}

module.exports = ProductService;