const { Order, Product, User } = require('../models');
const { AppError } = require('../middleware/errorHandler');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      yearOrders,
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      pendingOrders,
      pendingApprovals,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: startOfYear } }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed'] }, 'items.printFile': '' }),
    ]);

    const [totalRevenue, monthRevenue, weekRevenue, todayRevenue] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'captured' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const topProducts = await Order.aggregate([
      { $match: { paymentStatus: 'captured' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          totalRevenue: 1,
          name: '$product.name',
          slug: '$product.slug',
          images: '$product.images',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        weekOrders,
        monthOrders,
        yearOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        monthRevenue: monthRevenue[0]?.total || 0,
        weekRevenue: weekRevenue[0]?.total || 0,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalUsers,
        newUsersToday,
        newUsersWeek,
        newUsersMonth,
        pendingOrders,
        pendingApprovals,
        topProducts,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, interval = 'daily' } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate + 'T23:59:59.999Z') : new Date();

    let groupId;
    if (interval === 'daily') {
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
    } else if (interval === 'weekly') {
      groupId = {
        year: { $year: '$createdAt' },
        week: { $isoWeek: '$createdAt' },
      };
    } else if (interval === 'monthly') {
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
    }

    const sales = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'captured',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: groupId,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    const totalSales = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'captured',
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          maxOrder: { $max: '$totalAmount' },
          minOrder: { $min: '$totalAmount' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      report: {
        interval,
        startDate: start,
        endDate: end,
        breakdown: sales,
        summary: totalSales[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          maxOrder: 0,
          minOrder: 0,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const [statusBreakdown, paymentStatusBreakdown, paymentMethodBreakdown] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      report: {
        statusBreakdown,
        paymentStatusBreakdown,
        paymentMethodBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const match = { paymentStatus: 'captured' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const topProducts = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          avgUnitPrice: { $avg: '$items.unitPrice' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit, 10) },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: {
          path: '$productDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          totalSold: 1,
          totalRevenue: 1,
          avgUnitPrice: { $round: ['$avgUnitPrice', 2] },
          orderCount: 1,
          slug: '$productDetails.slug',
          images: '$productDetails.images',
          category: '$productDetails.category',
        },
      },
    ]);

    res.status(200).json({ success: true, products: topProducts });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueChart = async (req, res, next) => {
  try {
    const { period = '30days' } = req.query;

    let startDate, groupId, dateFormat;

    if (period === '12months') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
      };
      dateFormat = 'year-month';
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      groupId = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' },
      };
      dateFormat = 'year-month-day';
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'captured',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupId,
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const formattedData = revenueData.map((item) => {
      if (dateFormat === 'year-month') {
        return {
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
          revenue: item.revenue,
          orders: item.orders,
        };
      }
      return {
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        revenue: item.revenue,
        orders: item.orders,
      };
    });

    const totalRevenue = formattedData.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = formattedData.reduce((sum, d) => sum + d.orders, 0);

    res.status(200).json({
      success: true,
      chart: {
        period,
        dateFormat,
        data: formattedData,
        summary: {
          totalRevenue,
          totalOrders,
          avgDailyRevenue: period === '30days' ? Math.round(totalRevenue / Math.min(formattedData.length, 30)) : Math.round(totalRevenue / Math.min(formattedData.length, 12)),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
