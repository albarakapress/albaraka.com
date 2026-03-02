let customers = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    return res.status(200).json(customers);
  }

  if (req.method === 'POST') {
    const newCustomer = { id: Date.now().toString(), ...req.body };
    customers.push(newCustomer);
    return res.status(201).json(newCustomer);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    customers = customers.filter(c => c.id !== id);
    return res.status(200).json({ message: 'Deleted' });
  }

  return res.status(405).json({ error: 'Not allowed' });
}
