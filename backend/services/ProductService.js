const Product = require('../models/ProductModel');
const Order = require('../models/OrderModel');
const User = require('../models/UserModel');


class ProductService {
    static async getAllProducts(req, res) {
        const { category, search, minPrice, maxPrice, sort = '-createdAt' } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
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
            .limit(limit)
            .lean(),
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
        const product = await Product.findById(id).lean();
        
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

    static async getRelatedProducts(pid, cid) {
  try {
    const related = await Product.find({
        category: cid,
        _id: { $ne: pid }, 
      })
      .select("-photo") 
      .limit(4)         
      .populate("category")
      .lean();

    return {
      success: true,
      related,
    };
  } catch (error) {
    return {
      success: false,
      message: "Error fetching related products",
      error,
    };
  }
};

static async toggleWishlist(userId, productId) {
  try {
    if (!userId) throw { status: 401, message: 'User ID missing in token' };
    const user = await User.findById(userId);
    if (!user) throw { status: 404, message: 'User not found' };

    const isAlreadyInWishlist = user.wishlist.includes(productId);

    if (isAlreadyInWishlist) {
      user.wishlist.pull(productId);
      await user.save();
      return { message: 'Product removed from wishlist successfully' };
    } else {
      user.wishlist.push(productId);
      await user.save();
      return { message: 'Product added to wishlist successfully' };
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    throw error.status ? error : { status: 500, message: 'Error toggling wishlist' };
  }
}

static async getWishlist(userId) {
  try {
    if (!userId) throw { status: 401, message: 'User ID missing in token' };
    const user = await User.findById(userId).populate('wishlist', 'name price images');
    if (!user) throw { status: 404, message: 'User not found' };
    return { wishlist: user.wishlist };
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error.status ? error : { status: 500, message: 'Error fetching wishlist' };
  }
}

static async filterProducts(filterData) {
  try {
    const { checked, radio, rating, search, category, page: p, limit: l } = filterData;
    const page = parseInt(p) || 1;
    const limit = parseInt(l) || 12;
    const skip = (page - 1) * limit;

    let args = {};

    // Handles multiple categories (checkboxes)
    if (checked && checked.length > 0) {
      args.category = { $in: checked };
    } 
    // Handles single category (dropdown) - if checked is empty
    else if (category && category !== 'All') {
      args.category = category;
    }

    if (radio && radio.length === 2) {
      args.price = { $gte: Number(radio[0]), $lte: Number(radio[1]) };
    }

    if (rating) {
      args.rating = { $gte: Number(rating) };
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      args.name = { $regex: escapedSearch, $options: 'i' };
    }

    const [products, total] = await Promise.all([
      Product.find(args)
        .select("-images") // Optional: exclude images array if only single image needed, but usually images are fine.
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(args)
    ]);

    return {
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Filter products error:', error);
    return {
      success: false,
      message: "Error filtering products",
      error: error.message,
    };
  }
}

}

module.exports = ProductService;