const { Order, Product, User, Cart } = require('../models');
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

    const [totalProducts, prevMonthOrders, prevMonthRevenue] = await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ createdAt: { $gte: startOfMonth, $lt: new Date(now) } }),
      Order.aggregate([
        { $match: { paymentStatus: 'captured', createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1), $lt: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const revenueChange = prevMonthRevenue[0]?.total > 0 ? Math.round(((monthRevenue[0]?.total || 0) - prevMonthRevenue[0].total) / prevMonthRevenue[0].total * 100) : 0;
    const ordersChange = monthOrders > 0 && prevMonthOrders > 0 ? Math.round(((monthOrders - prevMonthOrders) / prevMonthOrders) * 100) : 0;
    const usersChange = newUsersMonth > 0 ? Math.round((newUsersToday / Math.max(newUsersMonth, 1)) * 100) : 0;

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
        activeUsers: totalUsers,
        newUsersToday,
        newUsersWeek,
        newUsersMonth,
        pendingOrders,
        pendingApprovals,
        totalProducts,
        revenueChange,
        ordersChange,
        usersChange,
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
          price: '$productDetails.basePrice',
          averageRating: '$productDetails.averageRating',
        },
      },
    ]);

    res.status(200).json({ success: true, products: topProducts });
  } catch (err) {
    next(err);
  }
};

exports.getMetrics = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalRevenue, monthRevenue, prevMonthRevenue, todayRevenue] = await Promise.all([
      Order.aggregate([{ $match: { paymentStatus: 'captured' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'captured', createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'captured', createdAt: { $gte: prevMonthStart, $lt: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([{ $match: { paymentStatus: 'captured', createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    ]);

    const totalRev = totalRevenue[0]?.total || 0;
    const monthRev = monthRevenue[0]?.total || 0;
    const prevRev = prevMonthRevenue[0]?.total || 0;
    const revenueChange = prevRev > 0 ? Math.round(((monthRev - prevRev) / prevRev) * 100) : 0;

    const [totalOrders, monthOrders, prevMonthOrders] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({ createdAt: { $gte: prevMonthStart, $lt: startOfMonth } }),
    ]);
    const ordersChange = prevMonthOrders > 0 ? Math.round(((monthOrders - prevMonthOrders) / prevMonthOrders) * 100) : 0;

    const [totalUsers, usersWithOrders, repeatUsers] = await Promise.all([
      User.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'captured' } }, { $group: { _id: '$user' } }, { $count: 'n' }]),
      Order.aggregate([
        { $match: { paymentStatus: 'captured' } },
        { $group: { _id: '$user', orders: { $sum: 1 } } },
        { $match: { orders: { $gt: 1 } } },
        { $count: 'n' },
      ]),
    ]);

    const conversionRate = totalUsers > 0 ? Math.round((usersWithOrders[0]?.n || 0) / totalUsers * 100) : 0;
    const repeatCustomerRate = totalUsers > 0 ? Math.round((repeatUsers[0]?.n || 0) / totalUsers * 100) : 0;
    const aov = totalOrders > 0 ? totalRev / totalOrders : 0;

    res.status(200).json({
      success: true,
      totalRevenue: totalRev,
      revenueChange,
      aov,
      aovChange: 0,
      conversionRate,
      conversionChange: 0,
      repeatCustomerRate,
      repeatChange: 0,
      todayRevenue: todayRevenue[0]?.total || 0,
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrdersByStatus = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { paymentStatus: 'captured' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const breakdown = await Order.aggregate([
      { $match: match },
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      success: true,
      labels: breakdown.map((b) => b._id),
      data: breakdown.map((b) => b.count),
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = { paymentStatus: 'captured' };
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const result = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$category.slug',
          name: { $first: '$category.name' },
          totalRevenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.status(200).json({
      success: true,
      labels: result.map((c) => c.name || c._id || 'Uncategorized'),
      data: result.map((c) => c.totalRevenue),
    });
  } catch (err) {
    next(err);
  }
};

exports.getCustomerAcquisition = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    const newUsers = await User.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);
    const recent = newUsers.filter((u) => {
      const d = new Date(u._id.year, u._id.month - 1, u._id.day);
      return d >= last30;
    });

    res.status(200).json({
      success: true,
      labels: recent.map((u) => `${u._id.year}-${String(u._id.month).padStart(2, '0')}-${String(u._id.day).padStart(2, '0')}`),
      data: recent.map((u) => u.count),
    });
  } catch (err) {
    next(err);
  }
};

exports.getExportReport = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(1000);

    const rows = [
      ['Order #', 'Date', 'Customer', 'Email', 'Total', 'Payment Status', 'Order Status'],
      ...orders.map((o) => [
        o.orderNumber || o._id.toString(),
        o.createdAt ? o.createdAt.toISOString() : '',
        o.user?.name || o.shippingAddress?.name || '',
        o.user?.email || '',
        o.totalAmount || 0,
        o.paymentStatus || '',
        o.orderStatus || '',
      ]),
    ];

    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="analytics-report.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

exports.getFunnel = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const cartsCreated = await Cart.countDocuments();
    const ordersPlaced = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'captured' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'delivered' });

    const steps = [
      { label: 'Registered Users', value: totalUsers },
      { label: 'Carts Created', value: cartsCreated },
      { label: 'Orders Placed', value: ordersPlaced },
      { label: 'Paid Orders', value: paidOrders },
      { label: 'Delivered', value: completedOrders },
    ];

    let prev = null;
    const conversionRates = steps.map((step) => {
      const rate = prev && prev > 0 ? Math.round((step.value / prev) * 1000) / 10 : (prev === 0 ? 0 : 100);
      prev = step.value;
      return rate;
    });

    res.status(200).json({ success: true, steps, conversionRates });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueChart = async (req, res, next) => {
  try {
    const { period = '30days' } = req.query;
    let startDate, groupId, dateFormat;

    if (period === '12months' || period === 'monthly') {
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
      labels: formattedData.map((d) => d.date),
      data: formattedData.map((d) => d.revenue),
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
