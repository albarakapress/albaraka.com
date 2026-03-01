import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("press_manager.db");

// Database Initialization
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    job_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    rate REAL DEFAULT 0,
    total_amount REAL DEFAULT 0,
    advance_amount REAL DEFAULT 0,
    due_amount REAL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    delivery_date DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    salary REAL DEFAULT 0,
    paid REAL DEFAULT 0,
    due REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const app = express();
app.use(express.json());

// API: Employees
app.get("/api/employees", (req, res) => {
  try {
    const employees = db.prepare("SELECT * FROM employees ORDER BY name ASC").all();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/employees", (req, res) => {
  try {
    const { name, phone, salary, paid } = req.body;
    const due = salary - paid;
    const info = db.prepare("INSERT INTO employees (name, phone, salary, paid, due) VALUES (?, ?, ?, ?, ?)").run(name, phone, salary, paid, due);
    res.json({ id: info.lastInsertRowid, ...req.body, due });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/employees/:id", (req, res) => {
  try {
    const { salary, paid } = req.body;
    const due = salary - paid;
    db.prepare("UPDATE employees SET salary = ?, paid = ?, due = ? WHERE id = ?").run(salary, paid, due, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/employees/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM employees WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get all customers
app.get("/api/customers", (req, res) => {
  try {
    const customers = db.prepare("SELECT * FROM customers ORDER BY name ASC").all();
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Create customer
app.post("/api/customers", (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const info = db.prepare("INSERT INTO customers (name, phone, address) VALUES (?, ?, ?)").run(name, phone, address);
    res.json({ id: info.lastInsertRowid, ...req.body });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete customer
app.delete("/api/customers/:id", (req, res) => {
  try {
    // Check if customer has orders
    const orders: any = db.prepare("SELECT COUNT(*) as count FROM orders WHERE customer_id = ?").get();
    if (orders.count > 0) {
      return res.status(400).json({ error: "Cannot delete customer with existing orders." });
    }
    db.prepare("DELETE FROM customers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get all orders
app.get("/api/orders", (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT orders.*, customers.name as customer_name 
      FROM orders 
      JOIN customers ON orders.customer_id = customers.id 
      ORDER BY order_date DESC
    `).all();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Create order
app.post("/api/orders", (req, res) => {
  try {
    const { customer_id, job_name, quantity, rate, advance_amount, delivery_date } = req.body;
    const total_amount = quantity * rate;
    const due_amount = total_amount - advance_amount;
    const info = db.prepare(`
      INSERT INTO orders (customer_id, job_name, quantity, rate, total_amount, advance_amount, due_amount, delivery_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(customer_id, job_name, quantity, rate, total_amount, advance_amount, due_amount, delivery_date);
    res.json({ id: info.lastInsertRowid, ...req.body, total_amount, due_amount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Update order status
app.patch("/api/orders/:id/status", (req, res) => {
  try {
    const { status } = req.body;
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete order
app.delete("/api/orders/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM orders WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// API: Stats
app.get("/api/stats", (req, res) => {
  try {
    const totalOrders: any = db.prepare("SELECT COUNT(*) as count FROM orders").get();
    const totalRevenue: any = db.prepare("SELECT SUM(total_amount) as sum FROM orders").get();
    const totalDue: any = db.prepare("SELECT SUM(due_amount) as sum FROM orders").get();
    const pendingOrders: any = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").get();

    res.json({
      totalOrders: totalOrders.count || 0,
      totalRevenue: totalRevenue.sum || 0,
      totalDue: totalDue.sum || 0,
      pendingOrders: pendingOrders.count || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Vite integration for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
}

// Only listen if not on Vercel
if (process.env.VERCEL === undefined) {
  app.listen(3000, "0.0.0.0", () => console.log("Server running on http://localhost:3000"));
}

export default app;
