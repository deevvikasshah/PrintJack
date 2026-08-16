const Design = require('../models/Design');
const Order = require('../models/Order');
const { deleteFromCloudinary } = require('../utils/cloudinary');

const RETENTION_DAYS = 30;

/**
 * Deletes Cloudinary assets + design records for drafts that were never used
 * in a completed flow, after the retention window. Prevents storage accrual
 * from abandoned carts / never-finished designs.
 */
const cleanupAbandonedUploads = async () => {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const stale = await Design.find({
    status: 'draft',
    createdAt: { $lt: cutoff },
  })
    .select('_id previewPublicId printFilePublicId previewImage printFile')
    .lean();

  if (stale.length === 0) {
    return { deleted: 0, totalStale: 0, skipped: 0, retentionDays: RETENTION_DAYS };
  }

  // Never delete a design that made it into an order.
  const referenced = new Set();
  const orders = await Order.find({ 'items.design': { $in: stale.map((d) => d._id) } })
    .select('items.design')
    .lean();
  for (const order of orders) {
    for (const item of order.items) {
      if (item.design) referenced.add(String(item.design));
    }
  }

  let deleted = 0;
  let skipped = 0;

  for (const design of stale) {
    if (referenced.has(String(design._id))) {
      skipped++;
      continue;
    }

    if (design.previewPublicId) {
      await deleteFromCloudinary(design.previewPublicId);
    }
    if (design.printFilePublicId && design.printFilePublicId !== design.previewPublicId) {
      await deleteFromCloudinary(design.printFilePublicId);
    }

    await Design.deleteOne({ _id: design._id });
    deleted++;
  }

  return { deleted, totalStale: stale.length, skipped, retentionDays: RETENTION_DAYS };
};

const runCleanupOnInterval = () => {
  const ONE_DAY = 24 * 60 * 60 * 1000;
  setInterval(async () => {
    try {
      const result = await cleanupAbandonedUploads();
      console.log(`Cleanup job: deleted ${result.deleted} stale upload(s) (${result.skipped} skipped, ${result.totalStale} found).`);
    } catch (err) {
      console.error('Cleanup job failed:', err.message);
    }
  }, ONE_DAY);
};

module.exports = { cleanupAbandonedUploads, runCleanupOnInterval, RETENTION_DAYS };