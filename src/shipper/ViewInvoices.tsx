// import  { useState, useEffect } from 'react';
// import { toast } from 'react-toastify';

// interface Invoice {
//   id: number;
//   shipment_id: number;
//   invoice_number: string;
//   amount: number;
//   status: string;
//   due_date: string;
//   shipment: {
//     route: {
//       from_location: string;
//       to_location: string;
//     };
//   };
// }

// const ViewInvoices = () => {
//   const [invoices, setInvoices] = useState<Invoice[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchInvoices = async () => {
//       try {
//         const token = localStorage.getItem('authToken');
//         if (!token) {
//           throw new Error('No auth token found');
//         }
//         const response = await fetch('http://127.0.0.1:8000/api/invoices', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });
//         const data = await response.json();
//         if (!response.ok) {
//           throw new Error(data.message || 'Failed to fetch invoices');
//         }
//         setInvoices(data.invoices || []);
//       } catch (err: any) {
//         toast.error(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInvoices();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8 flex items-center justify-center">
//       <div className="relative max-w-4xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6">
//         <h1 className="text-3xl font-bold mb-4 text-gray-900">My Invoices</h1>
//         {loading ? (
//           <p>Loading invoices...</p>
//         ) : invoices.length === 0 ? (
//           <p>No invoices found.</p>
//         ) : (
//           <table className="w-full text-left">
//             <thead>
//               <tr>
//                 <th className="p-2">Invoice #</th>
//                 <th className="p-2">Route</th>
//                 <th className="p-2">Amount</th>
//                 <th className="p-2">Status</th>
//                 <th className="p-2">Due Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices.map((invoice) => (
//                 <tr key={invoice.id}>
//                   <td className="p-2">{invoice.invoice_number}</td>
//                   <td className="p-2">{`${invoice.shipment.route.from_location} to ${invoice.shipment.route.to_location}`}</td>
//                   <td className="p-2">${invoice.amount}</td>
//                   <td className="p-2">{invoice.status}</td>
//                   <td className="p-2">{new Date(invoice.due_date).toLocaleDateString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ViewInvoices;