export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    // In production, calculate from actual data
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      totalDue: 0,
      pendingOrders: 0
    };
    return res.status(200).json(stats);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
