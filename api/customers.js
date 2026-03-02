let customers = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(customers);
  }

  if (req.method === 'POST') {
    const newCustomer = {
      id: customers.length + 1,
      ...req.body
    };
    customers.push(newCustomer);
    return res.status(200).json(newCustomer);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
