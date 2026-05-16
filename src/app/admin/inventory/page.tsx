import { AlertTriangle, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const inventory = [
  { id: '1', name: 'Daikin 1.5HP Inverter Split Type', sku: 'DAI-1.5-INV', category: 'Residential AC', stock: 5, minStock: 2, price: 38000, status: 'ok' },
  { id: '2', name: 'Carrier 1HP Standard Split Type', sku: 'CAR-1HP-STD', category: 'Residential AC', stock: 3, minStock: 2, price: 22000, status: 'ok' },
  { id: '3', name: 'Midea 2HP Inverter Split Type', sku: 'MID-2HP-INV', category: 'Residential AC', stock: 2, minStock: 2, price: 34000, status: 'low' },
  { id: '4', name: 'Panasonic 1HP Window Type', sku: 'PAN-1HP-WIN', category: 'Residential AC', stock: 4, minStock: 2, price: 15000, status: 'ok' },
  { id: '5', name: 'LG 1.5HP Dual Inverter', sku: 'LG-1.5-DUAL', category: 'Residential AC', stock: 2, minStock: 2, price: 42000, status: 'low' },
  { id: '6', name: 'Daikin 2.5HP Cassette Type', sku: 'DAI-2.5-CAS', category: 'Commercial AC', stock: 1, minStock: 1, price: 85000, status: 'ok' },
  { id: '7', name: 'Copper Tube 1/4" ×50ft', sku: 'COP-025-50', category: 'HVAC Supplies', stock: 3, minStock: 5, price: 1200, status: 'low' },
  { id: '8', name: 'R-410A Refrigerant 10kg', sku: 'REF-410A-10', category: 'HVAC Supplies', stock: 1, minStock: 3, price: 4800, status: 'low' },
  { id: '9', name: 'Two-Stage Vacuum Pump 3CFM', sku: 'VAC-3CFM-2S', category: 'Tools', stock: 2, minStock: 1, price: 4500, status: 'ok' },
];

const lowStockCount = inventory.filter((i) => i.status === 'low').length;

export default function AdminInventoryPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e3a5f]">Inventory</h1>
          <p className="text-gray-500 text-sm">{inventory.length} items · {lowStockCount} low stock</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#f0a500] text-[#1e3a5f] font-bold rounded-lg hover:bg-yellow-400 transition-colors">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={18} className="text-red-500 shrink-0" />
          <span className="text-sm text-red-700 font-medium">{lowStockCount} items are below minimum stock level. Reorder soon.</span>
        </div>
      )}

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Product</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">SKU</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Price</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Stock</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inventory.map((item) => (
              <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.status === 'low' ? 'bg-red-50/40' : ''}`}>
                <td className="px-5 py-3 font-medium text-[#1e3a5f]">{item.name}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                <td className="px-5 py-3 text-gray-600">{item.category}</td>
                <td className="px-5 py-3 font-semibold text-[#1e3a5f]">{formatPrice(item.price)}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${item.stock <= item.minStock ? 'text-red-600' : 'text-[#1e3a5f]'}`}>{item.stock}</span>
                    <span className="text-xs text-gray-400">/ min {item.minStock}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  {item.status === 'low' ? (
                    <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium w-fit">
                      <AlertTriangle size={10} /> Low Stock
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">OK</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 transition-colors">
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
