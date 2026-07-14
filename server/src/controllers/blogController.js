const { Blog } = require('../models');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

exports.getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;

    const query = {};

    if (req.user && ['admin', 'super_admin'].includes(req.user.role)) {
      if (status) query.status = status;
    } else {
      query.status = 'published';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const posts = await Blog.paginate(query, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: '-publishedAt',
      populate: [{ path: 'author', select: 'name avatar' }],
    });

    res.status(200).json({
      success: true,
      posts: posts.docs,
      pagination: {
        total: posts.totalDocs,
        pages: posts.totalPages,
        page: posts.page,
        limit: posts.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'name avatar');

    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.status !== 'published' && (!req.user || !['admin', 'super_admin'].includes(req.user.role))) {
      throw new AppError('Post not found', 404);
    }

    post.views += 1;
    await post.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, excerpt, category, tags, status, metaTitle, metaDescription } = req.body;

    if (!title || !content) {
      throw new AppError('Title and content are required', 400);
    }

    const postData = {
      title,
      content,
      excerpt: excerpt || '',
      category: category || 'General',
      tags: typeof tags === 'string' ? JSON.parse(tags) : (tags || []),
      status: status || 'draft',
      metaTitle,
      metaDescription,
      author: req.user._id,
    };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'printjack/blog',
        width: 1200,
        height: 630,
        crop: 'fill',
      });
      postData.featuredImage = result.secure_url;
    }

    const post = await Blog.create(postData);

    res.status(201).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const allowedFields = ['title', 'content', 'excerpt', 'category', 'tags', 'status', 'metaTitle', 'metaDescription'];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        post[field] = field === 'tags' && typeof req.body[field] === 'string'
          ? JSON.parse(req.body[field])
          : req.body[field];
      }
    });

    if (req.file) {
      if (post.featuredImage) {
        try {
          const publicId = post.featuredImage.split('/').pop().split('.')[0];
          await deleteFromCloudinary(publicId);
        } catch (e) {
          console.error('Failed to delete old featured image:', e.message);
        }
      }
      const result = await uploadToCloudinary(req.file.path, {
        folder: 'printjack/blog',
        width: 1200,
        height: 630,
        crop: 'fill',
      });
      post.featuredImage = result.secure_url;
    }

    await post.save();

    res.status(200).json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    if (post.featuredImage) {
      try {
        const publicId = post.featuredImage.split('/').pop().split('.')[0];
        await deleteFromCloudinary(publicId);
      } catch (e) {
        console.error('Failed to delete featured image:', e.message);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getPostsByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const posts = await Blog.paginate(
      { tags: { $in: [new RegExp(`^${tag}$`, 'i')] }, status: 'published' },
      {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: '-publishedAt',
        populate: [{ path: 'author', select: 'name avatar' }],
      }
    );

    res.status(200).json({
      success: true,
      posts: posts.docs,
      pagination: {
        total: posts.totalDocs,
        pages: posts.totalPages,
        page: posts.page,
        limit: posts.limit,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getRelatedPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;

    const post = await Blog.findById(id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    const query = {
      _id: { $ne: post._id },
      status: 'published',
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } },
      ],
    };

    const related = await Blog.find(query)
      .populate('author', 'name avatar')
      .sort('-publishedAt')
      .limit(parseInt(limit, 10));

    res.status(200).json({ success: true, posts: related });
  } catch (err) {
    next(err);
  }
};
