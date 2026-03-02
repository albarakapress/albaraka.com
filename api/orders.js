let orders = [];
let customers = []; // This should sync with customers API in production

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(orders);
  }

  if (req.method === 'POST') {
    const { customer_id, job_name, quantity, rate, advance_amount, delivery_date } = req.body;
    
    const total_amount = Number(quantity) * Number(rate);
    const due_amount = total_amount - Number(advance_amount);
    
    const newOrder = {
      id: orders.length + 1,
      customer_id: Number(customer_id),
      customer_name: `Customer ${customer_id}`, // In production, fetch from customers
      job_name,
      quantity: Number(quantity),
      rate: Number(rate),
      total_amount,
      advance_amount: Number(advance_amount),
      due_amount,
      status: 'pending',
      order_date: new Date().toISOString(),
      delivery_date
    };
    
    orders.push(newOrder);
    return res.status(200).json(newOrder);
  }

  if (req.method === 'DELETE') {
    const id = parseInt(req.url.split('/').pop());
    orders = orders.filter(o => o.id !== id);
    return res.status(200).json({ message: 'Deleted' });
  }

  if (req.method === 'PATCH') {
    const id = parseInt(req.url.split('/')[3]);
    const { status } = req.body;
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index].status = status;
      return res.status(200).json(orders[index]);
    }
    return res.status(404).json({ error: 'Not found' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
