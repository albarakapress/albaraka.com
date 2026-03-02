let orders = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const newOrder = { id: Date.now().toString(), ...req.body };
    orders.push(newOrder);
    return res.status(201).json(newOrder);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    orders = orders.filter(o => o.id !== id);
    return res.status(200).json({ message: 'Deleted' });
  }

  return res.status(405).json({ error: 'Not allowed' });
}
