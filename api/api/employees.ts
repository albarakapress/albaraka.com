let employees = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    return res.status(200).json(employees);
  }

  if (req.method === 'POST') {
    const newEmployee = { id: Date.now().toString(), ...req.body };
    employees.push(newEmployee);
    return res.status(201).json(newEmployee);
  }

  if (req.method === 'DELETE') {
    const id = req.query.id;
    employees = employees.filter(e => e.id !== id);
    return res.status(200).json({ message: 'Deleted' });
  }

  return res.status(405).json({ error: 'Not allowed' });
}
