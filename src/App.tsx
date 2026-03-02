import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Plus, 
  Printer, 
  Trash2, 
  Search, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Types
interface Customer {
  id: number;
  name: string;
  phone: string;
  address: string;
}

interface Order {
  id: number;
  customer_id: number;
  customer_name: string;
  job_name: string;
  quantity: number;
  rate: number;
  total_amount: number;
  advance_amount: number;
  due_amount: number;
  status: 'pending' | 'completed' | 'delivered';
  order_date: string;
  delivery_date: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalDue: number;
  pendingOrders: number;
}

interface Employee {
  id: number;
  name: string;
  phone: string;
  salary: number;
  paid: number;
  due: number;
}

const COMPANY_DETAILS = {
  name: "Al-Baraka Press",
  phones: ["01961999390", "01716054334"],
  email: "albarakapressbd@gmail.com",
  location: "Morioumbibi shahi masjid market dokan no-6 Nilkhet, Dhaka"
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "customers" | "orders" | "employees">("dashboard");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });
  const [newEmployee, setNewEmployee] = useState({ name: "", phone: "", salary: 0 as number | string, paid: 0 as number | string });
  const [newOrder, setNewOrder] = useState({
    customer_id: "",
    job_name: "",
    quantity: 0 as number | string,
    rate: 0 as number | string,
    advance_amount: 0 as number | string,
    delivery_date: ""
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    try {
      const savedCustomers = localStorage.getItem('albaraka_customers');
      const savedOrders = localStorage.getItem('albaraka_orders');
      const savedEmployees = localStorage.getItem('albaraka_employees');
      
      const customersData = savedCustomers ? JSON.parse(savedCustomers) : [];
      const ordersData = savedOrders ? JSON.parse(savedOrders) : [];
      const employeesData = savedEmployees ? JSON.parse(savedEmployees) : [];
      
      setCustomers(customersData);
      setOrders(ordersData);
      setEmployees(employeesData);
      
      // Calculate stats
      const statsData: Stats = {
        totalOrders: ordersData.length,
        totalRevenue: ordersData.reduce((sum: number, o: Order) => sum + (o.total_amount || 0), 0),
        totalDue: ordersData.reduce((sum: number, o: Order) => sum + (o.due_amount || 0), 0),
        pendingOrders: ordersData.filter((o: Order) => o.status === 'pending').length
      };
      setStats(statsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: typeof activeTab) => {
    if (tab === "employees" && !isOwner) {
      setShowPasswordModal(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === "albaraka786") {
      setIsOwner(true);
      setActiveTab("employees");
      setShowPasswordModal(false);
      setPasswordInput("");
      setShowPassword(false);
    } else {
      alert("Incorrect Password! Please try again.");
    }
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomerData: Customer = {
      id: Date.now(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      address: newCustomer.address
    };
    const updated = [...customers, newCustomerData];
    setCustomers(updated);
    localStorage.setItem('albaraka_customers', JSON.stringify(updated));
    setNewCustomer({ name: "", phone: "", address: "" });
    setShowCustomerModal(false);
    loadData();
  };

  const handleDeleteCustomer = (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    localStorage.setItem('albaraka_customers', JSON.stringify(updated));
    loadData();
  };

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const total = Number(newOrder.quantity) * Number(newOrder.rate);
    const due = total - Number(newOrder.advance_amount);
    const customer = customers.find(c => c.id === parseInt(newOrder.customer_id));
    
    const newOrderData: Order = {
      id: Date.now(),
      customer_id: parseInt(newOrder.customer_id),
      customer_name: customer?.name || "Unknown",
      job_name: newOrder.job_name,
      quantity: Number(newOrder.quantity),
      rate: Number(newOrder.rate),
      total_amount: total,
      advance_amount: Number(newOrder.advance_amount),
      due_amount: due,
      status: 'pending',
      order_date: new Date().toISOString(),
      delivery_date: newOrder.delivery_date
    };
    
    const updated = [...orders, newOrderData];
    setOrders(updated);
    localStorage.setItem('albaraka_orders', JSON.stringify(updated));
    setNewOrder({
      customer_id: "",
      job_name: "",
      quantity: 0,
      rate: 0,
      advance_amount: 0,
      delivery_date: ""
    });
    setShowOrderModal(false);
    loadData();
  };

  const handleDeleteOrder = (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    localStorage.setItem('albaraka_orders', JSON.stringify(updated));
    loadData();
  };

  const handleUpdateStatus = (id: number, status: string) => {
    const updated = orders.map(o => 
      o.id === id ? {...o, status: status as Order['status']} : o
    );
    setOrders(updated);
    localStorage.setItem('albaraka_orders', JSON.stringify(updated));
    loadData();
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newEmpData: Employee = {
      id: Date.now(),
      name: newEmployee.name,
      phone: newEmployee.phone,
      salary: Number(newEmployee.salary),
      paid: Number(newEmployee.paid),
      due: Number(newEmployee.salary) - Number(newEmployee.paid)
    };
    const updated = [...employees, newEmpData];
    setEmployees(updated);
    localStorage.setItem('albaraka_employees', JSON.stringify(updated));
    setNewEmployee({ name: "", phone: "", salary: 0, paid: 0 });
    setShowEmployeeModal(false);
    loadData();
    alert("Employee added successfully!");
  };

  const handleDeleteEmployee = (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem('albaraka_employees', JSON.stringify(updated));
    loadData();
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.6; padding: 0; margin: 0; background: #fff; }
            .container { max-width: 800px; margin: 0 auto; padding: 60px; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 60px; border-bottom: 4px solid #2563eb; padding-bottom: 30px; }
            .company-info h1 { margin: 0; color: #2563eb; font-size: 32px; font-weight: 800; }
            .company-info p { margin: 4px 0; font-size: 13px; color: #64748b; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0; font-size: 42px; font-weight: 800; color: #e2e8f0; }
            .invoice-title .inv-no { font-size: 16px; font-weight: 700; color: #2563eb; margin-top: 10px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 60px; }
            .details-box h3 { font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 12px; }
            .details-box p { margin: 4px 0; font-weight: 600; font-size: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background: #f8fafc; text-align: left; padding: 16px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
            td { padding: 20px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
            .totals { margin-left: auto; width: 300px; background: #f8fafc; padding: 24px; border-radius: 24px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; color: #64748b; }
            .total-row.grand { border-top: 2px solid #e2e8f0; margin-top: 15px; padding-top: 15px; font-weight: 800; font-size: 20px; color: #2563eb; }
            .footer { margin-top: 80px; display: flex; justify-content: space-between; }
            .signature { border-top: 2px solid #f1f5f9; width: 220px; text-align: center; padding-top: 12px; font-size: 12px; color: #94a3b8; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="company-info">
                <h1>${COMPANY_DETAILS.name}</h1>
                <p>${COMPANY_DETAILS.location}</p>
                <p>Phone: ${COMPANY_DETAILS.phones.join(", ")}</p>
                <p>Email: ${COMPANY_DETAILS.email}</p>
              </div>
              <div class="invoice-title">
                <h2>Invoice</h2>
                <div class="inv-no">#INV-${order.id.toString().slice(-5)}</div>
                <p style="font-size: 12px; color: #94a3b8;">Date: ${new Date(order.order_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div class="details">
              <div class="details-box">
                <h3>Bill To:</h3>
                <p style="font-size: 18px; color: #0f172a;">${order.customer_name}</p>
                <p>${customers.find(c => c.id === order.customer_id)?.phone || ''}</p>
                <p style="color: #64748b;">${customers.find(c => c.id === order.customer_id)?.address || ''}</p>
              </div>
              <div class="details-box" style="text-align: right;">
                <h3>Delivery Date:</h3>
                <p style="font-size: 18px;">${order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</p>
                <p>Status: <span style="text-transform: uppercase; font-weight: 800; color: #2563eb;">${order.status}</span></p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Rate</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="font-weight: 700;">${order.job_name}</td>
                  <td style="text-align: center;">${order.quantity}</td>
                  <td style="text-align: right;">৳${order.rate.toFixed(2)}</td>
                  <td style="text-align: right; font-weight: 700;">৳${order.total_amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="totals">
              <div class="total-row"><span>Subtotal</span><span>৳${order.total_amount.toFixed(2)}</span></div>
              <div class="total-row"><span>Advance Paid</span><span style="color: #059669;">- ৳${order.advance_amount.toFixed(2)}</span></div>
              <div class="total-row grand"><span>Total Due</span><span>৳${order.due_amount.toFixed(2)}</span></div>
            </div>
            <div class="footer">
              <div class="signature">Customer Signature</div>
              <div class="signature">Authorized Signature</div>
            </div>
          </div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 rotate-3">
              <Printer size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-none">Al-Baraka</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Press Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="px-4 mb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
          </div>
          {[
            { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { id: "customers", icon: Users, label: "Customers" },
            { id: "orders", icon: ClipboardList, label: "Orders" },
            { id: "employees", icon: Users, label: "Employees" }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => handleTabChange(item.id as typeof activeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${activeTab === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <item.icon size={20} className={activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-blue-500"} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Support</p>
            <div className="space-y-3">
              <a href="tel:01961999390" className="flex items-center gap-3 text-sm font-medium hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center"><Phone size={14} /></div>
                01961999390
              </a>
              <a href="mailto:albarakapressbd@gmail.com" className="flex items-center gap-3 text-sm font-medium hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center"><Mail size={14} /></div>
                Email Us
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-10 px-10 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black tracking-tight capitalize">{activeTab}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage your printing business efficiently</p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setShowCustomerModal(true)} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2">
              <Plus size={18} strokeWidth={2.5} />New Customer
            </button>
            <button onClick={() => setShowOrderModal(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-200">
              <Plus size={18} strokeWidth={2.5} />New Order
            </button>
            {activeTab === "employees" && (
              <button onClick={() => setShowEmployeeModal(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2">
                <Plus size={18} strokeWidth={2.5} />Add Employee
              </button>
            )}
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={<ClipboardList size={24} />} color="from-blue-500 to-indigo-600" lightColor="bg-blue-50" />
                <StatCard title="Total Revenue" value={`৳${stats?.totalRevenue?.toLocaleString() || 0}`} icon={<TrendingUp size={24} />} color="from-emerald-500 to-teal-600" lightColor="bg-emerald-50" />
                <StatCard title="Total Due" value={`৳${stats?.totalDue?.toLocaleString() || 0}`} icon={<AlertCircle size={24} />} color="from-rose-500 to-pink-600" lightColor="bg-rose-50" />
                <StatCard title="Pending Jobs" value={stats?.pendingOrders || 0} icon={<Clock size={24} />} color="from-amber-500 to-orange-600" lightColor="bg-amber-50" />
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h3 className="font-black text-xl tracking-tight">Recent Orders</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">The latest jobs in your press</p>
                  </div>
                  <button onClick={() => setActiveTab("orders")} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-blue-600 text-xs font-bold hover:bg-blue-50 transition-all">View All Orders</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <th className="px-8 py-5">Job Name</th>
                        <th className="px-8 py-5">Customer</th>
                        <th className="px-8 py-5">Total</th>
                        <th className="px-8 py-5">Due</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="group hover:bg-blue-50/30 transition-colors">
                          <td className="px-8 py-6">
                            <div className="font-bold text-slate-800">{order.job_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">#INV-{order.id.toString().slice(-4)}</div>
                          </td>
                          <td className="px-8 py-6 text-slate-600 font-medium">{order.customer_name}</td>
                          <td className="px-8 py-6 font-bold text-slate-900">৳{order.total_amount?.toLocaleString()}</td>
                          <td className="px-8 py-6">
                            <span className={`font-black ${order.due_amount > 0 ? "text-rose-600" : "text-emerald-600"}`}>৳{order.due_amount?.toLocaleString()}</span>
                          </td>
                          <td className="px-8 py-6"><StatusBadge status={order.status} /></td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => printInvoice(order)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all"><Printer size={18} /></button>
                              <button onClick={() => handleDeleteOrder(order.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">No orders yet. Create your first order!</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Customers */}
          {activeTab === "customers" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search customers..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-5">Name</th>
                      <th className="px-8 py-5">Phone</th>
                      <th className="px-8 py-5">Address</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-800">{customer.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {customer.id.toString().slice(-4)}</div>
                        </td>
                        <td className="px-8 py-6 text-slate-600 font-medium">{customer.phone}</td>
                        <td className="px-8 py-6 text-slate-500 text-sm max-w-xs truncate">{customer.address}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDeleteCustomer(customer.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400">No customers yet. Add your first customer!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-5">Order Info</th>
                      <th className="px-8 py-5">Customer</th>
                      <th className="px-8 py-5">Financials</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Delivery</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-800">{order.job_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">#INV-{order.id.toString().slice(-4)}</div>
                        </td>
                        <td className="px-8 py-6 text-slate-600 font-medium">{order.customer_name}</td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-900">Total: ৳{order.total_amount?.toLocaleString()}</div>
                          <div className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${order.due_amount > 0 ? "text-rose-600" : "text-emerald-600"}`}>Due: ৳{order.due_amount?.toLocaleString()}</div>
                        </td>
                        <td className="px-8 py-6">
                          <select value={order.status} onChange={(e) => handleUpdateStatus(order.id, e.target.value)} className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none cursor-pointer">
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-slate-500 text-sm font-medium">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => printInvoice(order)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 flex items-center justify-center transition-all"><Printer size={18} /></button>
                            <button onClick={() => handleDeleteOrder(order.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">No orders yet. Create your first order!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Employees */}
          {activeTab === "employees" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                <div>
                  <h3 className="font-black text-xl tracking-tight">Employee Payroll</h3>
                  <p className="text-xs text-slate-400 font-medium mt-1">Manage staff salaries and payments</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-5">Employee Name</th>
                      <th className="px-8 py-5">Phone</th>
                      <th className="px-8 py-5">Salary</th>
                      <th className="px-8 py-5">Paid</th>
                      <th className="px-8 py-5">Due</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="group hover:bg-blue-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-800">{emp.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: {emp.id.toString().slice(-4)}</div>
                        </td>
                        <td className="px-8 py-6 text-slate-600 font-medium">{emp.phone}</td>
                        <td className="px-8 py-6 font-bold text-slate-900">৳{emp.salary?.toLocaleString()}</td>
                        <td className="px-8 py-6 font-bold text-emerald-600">৳{emp.paid?.toLocaleString()}</td>
                        <td className="px-8 py-6"><span className={`font-black ${emp.due > 0 ? "text-rose-600" : "text-emerald-600"}`}>৳{emp.due?.toLocaleString()}</span></td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDeleteEmployee(emp.id)} className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 flex items-center justify-center transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {employees.length === 0 && (
                      <tr><td colSpan={6} className="px-8 py-12 text-center text-slate-400">No employees yet. Add your first employee!</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showCustomerModal && (
          <Modal title="Add New Customer" onClose={() => setShowCustomerModal(false)}>
            <form onSubmit={handleAddCustomer} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                <input required type="text" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all" placeholder="e.g. Rahim Ahmed" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phone Number</label>
                <input required type="text" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all" placeholder="017XXXXXXXX" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Address</label>
                <textarea value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all min-h-[100px]" placeholder="Customer's full address..." />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">Save Customer Profile</button>
            </form>
          </Modal>
        )}

        {showOrderModal && (
          <Modal title="Create New Order" onClose={() => setShowOrderModal(false)}>
            <form onSubmit={handleAddOrder} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Select Customer</label>
                <select required value={newOrder.customer_id} onChange={(e) => setNewOrder({...newOrder, customer_id: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none cursor-pointer">
                  <option value="">Choose a customer...</option>
                  {customers.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.phone})</option>))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Job Description</label>
                <input required type="text" value={newOrder.job_name} onChange={(e) => setNewOrder({...newOrder, job_name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all" placeholder="e.g. 1000 Visiting Cards" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Quantity</label>
                  <input required type="number" value={newOrder.quantity} onChange={(e) => setNewOrder({...newOrder, quantity: e.target.value === "" ? "" : parseInt(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Rate (৳)</label>
                  <input required type="number" step="0.01" value={newOrder.rate} onChange={(e) => setNewOrder({...newOrder, rate: e.target.value === "" ? "" : parseFloat(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Advance (৳)</label>
                  <input type="number" value={newOrder.advance_amount} onChange={(e) => setNewOrder({...newOrder, advance_amount: e.target.value === "" ? "" : parseFloat(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Delivery Date</label>
                  <input type="date" value={newOrder.delivery_date} onChange={(e) => setNewOrder({...newOrder, delivery_date: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" />
                </div>
              </div>
              <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex justify-between items-center shadow-xl shadow-blue-200">
                <div>
                  <p className="text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em] mb-1">Total Bill Amount</p>
                  <p className="text-3xl font-black tracking-tight">৳{(Number(newOrder.quantity) * Number(newOrder.rate)).toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><TrendingUp size={24} /></div>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Confirm & Create Order</button>
            </form>
          </Modal>
        )}

        {showEmployeeModal && (
          <Modal title="Add New Employee" onClose={() => setShowEmployeeModal(false)}>
            <form onSubmit={handleAddEmployee} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Employee Name</label>
                <input required type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" placeholder="e.g. Karim Ullah" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Phone Number</label>
                <input required type="text" value={newEmployee.phone} onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" placeholder="01XXXXXXXXX" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Monthly Salary (৳)</label>
                  <input required type="number" value={newEmployee.salary} onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value === "" ? "" : parseFloat(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Paid Amount (৳)</label>
                  <input required type="number" value={newEmployee.paid} onChange={(e) => setNewEmployee({...newEmployee, paid: e.target.value === "" ? "" : parseFloat(e.target.value)})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none" />
                </div>
              </div>
              <div className="bg-rose-50 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Salary Due:</span>
                <span className="text-lg font-black text-rose-700">৳{(Number(newEmployee.salary) - Number(newEmployee.paid)).toLocaleString()}</span>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">Save Employee Data</button>
            </form>
          </Modal>
        )}

        {showPasswordModal && (
          <Modal title="Owner Verification" onClose={() => setShowPasswordModal(false)}>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4"><AlertCircle size={32} /></div>
                <p className="text-sm text-slate-600 font-medium">This section is restricted to the Owner only. Please enter your password to continue.</p>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Owner Password</label>
                <div className="relative">
                  <input required autoFocus type={showPassword ? "text" : "password"} value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none text-center tracking-widest" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">Unlock Access</button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, color, lightColor }: { title: string, value: string | number, icon: React.ReactNode, color: string, lightColor: string }) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 group overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${lightColor} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
      <div className="flex flex-col gap-6 relative z-10">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform duration-300`}>{icon}</div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    completed: "bg-blue-50 text-blue-600 border-blue-100",
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100"
  };
  return <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>{status}</span>;
}

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }} className="bg-white rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-2xl font-black tracking-tight">{title}</h3>
          <button onClick={onClose} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"><X size={20} /></button>
        </div>
        <div className="p-10">{children}</div>
      </motion.div>
    </motion.div>
  );
}
