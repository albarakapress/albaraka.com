export default function handler(req, res) {
  res.status(200).json({
    totalOrders: 1,
    totalRevenue: 5000,
    totalDue: 1000
  });
}
