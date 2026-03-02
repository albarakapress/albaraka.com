let employees = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json(employees);
  }

  if (req.method === 'POST') {
    const { name, phone, salary, paid } = req.body;
    const newEmployee = {
      id: employees.length + 1,
      name,
      phone,
      salary: Number(salary),
      paid: Number(paid),
      due: Number(salary) - Number(paid)
    };
    employees.push(newEmployee);
    return res.status(200).json(newEmployee);
  }

  if (req.method === 'DELETE') {
    const id = parseInt(req.url.split('/').pop());
    employees = employees.filter(e => e.id !== id);
    return res.status(200).json({ message: 'Deleted' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
