export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'GET') {
    return res.status(200).json({
      totalCustomers: 0,
      totalEmployees: 0,
      totalOrders: 0,
      totalRevenue: 0
    });
  }

  return res.status(405).json({ error: 'Not allowed' });
}
