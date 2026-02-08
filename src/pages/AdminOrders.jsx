// src/pages/AdminOrders.jsx
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue, update, remove } from "firebase/database";
import axios from "axios";
import {
  MdLocalShipping,
  MdDelete,
  MdPrint,
  MdSearch,
} from "react-icons/md";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState(null);
  const [returnRequests, setReturnRequests] = useState([]);

  // Date Filters
  const [dateFilter, setDateFilter] = useState("All");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

  // -------------------------------------------------------
  // Load Orders Live
  // -------------------------------------------------------
  useEffect(() => {
    const ordersRef = ref(db, "orders");
    return onValue(ordersRef, (snap) => {
      if (!snap.exists()) return setOrders([]);

      const all = [];
      const data = snap.val();

      Object.entries(data).forEach(([uid, userOrders]) => {
        Object.entries(userOrders).forEach(([oid, order]) => {
       all.push({
  userId: uid,
  id: oid,
  orderId: order.orderId || oid,

  // ✅ SHIPPING MAPPING
  customer_name: order.shipping?.name || "",
  address: order.shipping?.address || "",
  city: order.shipping?.city || "",
  state: order.shipping?.state || "",
  pincode: order.shipping?.pincode || "",
  phone: order.shipping?.phone || "",

  ...order,
});

        });
      });

      setOrders(all.reverse());
    });
  }, []);
useEffect(() => {
  const rRef = ref(db, "returnRequests");
  return onValue(rRef, (snap) => {
    if (!snap.exists()) return setReturnRequests([]);

    const all = [];
    Object.entries(snap.val()).forEach(([uid, orders]) => {
      Object.entries(orders).forEach(([oid, req]) => {
        all.push({ userId: uid, orderId: oid, req });
      });
    });

    setReturnRequests(all.reverse());
  });
}, []);

  // -------------------------------------------------------
  // Load Cancel Requests
  // -------------------------------------------------------
  useEffect(() => {
    const reqRef = ref(db, "cancelRequests");
    return onValue(reqRef, (snap) => {
      if (!snap.exists()) return setCancelRequests([]);

      const all = [];
      const data = snap.val();

      Object.entries(data).forEach(([uid, entries]) => {
        Object.entries(entries).forEach(([oid, req]) => {
          all.push({ userId: uid, orderId: oid, req });
        });
      });

      setCancelRequests(all.reverse());
    });
  }, []);

  // -------------------------------------------------------
  // Date Filter Logic
  // -------------------------------------------------------
 const filterByDate = (order) => {
  if (!order.createdAt) return true;

  const ts = Number(order.createdAt);
  const orderDate = new Date(ts);

  const today = new Date();
  today.setHours(0,0,0,0);

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0,0,0,0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  sevenDaysAgo.setHours(0,0,0,0);

  if (dateFilter === "All") return true;

  // TODAY
  if (dateFilter === "Today") {
    return orderDate.toDateString() === today.toDateString();
  }

  // YESTERDAY
  if (dateFilter === "Yesterday") {
    return orderDate.toDateString() === yesterday.toDateString();
  }

  // LAST 7 DAYS (SMART LOGIC)
  if (dateFilter === "Last 7 Days") {
    // Exclude Today & Yesterday
    return (
      orderDate < yesterday && 
      orderDate >= sevenDaysAgo
    );
  }

  // THIS MONTH
  if (dateFilter === "This Month") {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return orderDate >= monthStart && orderDate <= today;
  }

  // CUSTOM
  if (dateFilter === "Custom") {
    if (!rangeStart || !rangeEnd) return true;
    const s = new Date(rangeStart);
    const e = new Date(rangeEnd);
    e.setHours(23, 59, 59, 999);
    return orderDate >= s && orderDate <= e;
  }

  return true;
};

const handleApproveReturn = async (userId, oid) => {
  await update(ref(db, `orders/${userId}/${oid}`), {
    returnStatus: "Approved",
  });

  await update(ref(db, `returnRequests/${userId}/${oid}`), {
    status: "Approved",
  });

  alert("Return Approved");
};
const handleRejectReturn = async (userId, oid) => {
  await update(ref(db, `orders/${userId}/${oid}`), {
    returnRequested: false,
    returnStatus: "Rejected",
  });

  await remove(ref(db, `returnRequests/${userId}/${oid}`));

  alert("Return Rejected");
};

  // -------------------------------------------------------
  // Combined Search + Filters
  // -------------------------------------------------------
const filteredOrders = useMemo(() => {
  const q = query.toLowerCase();

  return orders
    .filter((o) => {
      // STATUS FILTER ACCURATE
      if (filter === "All") return true;

      if (filter === "Active") {
        // Active = NEW + CONFIRMED (not shipped)
        return ["Pending", "Confirmed", "Processing"].includes(o.status);
      }
if (filter === "Return Requested") {
  return o.returnStatus === "Requested";
}

      return o.status === filter;
    })
    .filter(filterByDate)
    .filter((o) => {
      if (!query) return true;
      return (
        o.orderId?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.phone?.toLowerCase().includes(q)
      );
    });
}, [orders, filter, query, dateFilter, rangeStart, rangeEnd]);


  // -------------------------------------------------------
  // Create Shipment
  // -------------------------------------------------------
  const handleCreateShipment = async (order) => {
    try {
      setLoadingId(order.id);

      const payload = {
        userId: order.userId,
       orderId: order.orderId || order.id,
        customer_name: order.customer_name,
        address:order.address,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
        phone: order.phone,
        email: order.email || "demo@mail.com",
        payment_method: order.paymentMode,
        price: Number(order.total),
        items: order.items || [],
      };

      const res = await axios.post(`${API}/create-shipment`, payload);
     const awb = res.data?.awb || "";


      await update(ref(db, `orders/${order.userId}/${order.id}`), {
        status: "Shipped",
        awbCode: awb,
        trackingUrl: awb
          ? `https://shiprocket.co/tracking/${awb}`
          : "",
      });

      alert("Shipment Created Successfully");
    } catch (err) {
      console.error(err);
      alert("Shipment Creation Failed");
    } finally {
      setLoadingId(null);
    }
  };

  // -------------------------------------------------------
  // Single Label Print
  // -------------------------------------------------------
  const handlePrintLabel = (order) => {
    const html = `
      <h2>Shipping Label</h2>
      <p>Order: ${order.orderId}</p>
      <p>Name: ${order.customer_name}</p>
      <p>Phone: ${order.phone}</p>
      <p>Address: ${order.address}, ${order.city}, ${order.state} - ${
      order.pincode
    }</p>
      <p>AWB: ${order.awbCode || "Not Generated"}</p>
      <script>window.print()</script>
    `;

    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
  };

  // -------------------------------------------------------
  // BULK LABEL PRINT (NEW)
  // -------------------------------------------------------
  const handleBulkLabelPrint = () => {
    const withLabel = orders.filter(
      (o) => o.awbCode && o.awbCode !== "" && o.trackingUrl
    );

    if (withLabel.length === 0) {
      alert("No labels available for printing.");
      return;
    }

    withLabel.forEach((order) => {
      window.open(order.trackingUrl, "_blank");
    });
  };

  // -------------------------------------------------------
  // Cancel Approve / Deny
  // -------------------------------------------------------
  const handleApproveCancel = async (userId, oid) => {
    await update(ref(db, `orders/${userId}/${oid}`), {
      status: "Cancelled",
      cancelRequested: false,
    });
    await remove(ref(db, `cancelRequests/${userId}/${oid}`));
    alert("Cancellation Approved");
  };

  const handleDenyCancel = async (userId, oid) => {
    await update(ref(db, `orders/${userId}/${oid}`), {
      cancelRequested: false,
    });
    alert("Denied");
  };

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Orders Management</h1>

      {/* Filters + Search + Bulk Print */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">

        {/* STATUS FILTERS */}
        <div className="flex gap-2">
          {["All", "Active", "Shipped", "Out For Delivery", "Delivered","Return Requested","Returned","Cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1 rounded-lg shadow-sm text-sm ${
                filter === f ? "bg-black text-white" : "bg-white border"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative ml-auto">
          <MdSearch className="absolute left-2 top-3 text-gray-500" />
          <input
            placeholder="Search orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border pl-9 pr-3 py-2 rounded-lg"
          />
        </div>

        {/* BULK PRINT BUTTON */}
        <button
          onClick={handleBulkLabelPrint}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg shadow"
        >
          <MdPrint size={18} /> Print All Labels
        </button>
      </div>

      {/* Date Filters */}
      <div className="flex gap-3 mb-6">
        {["All", "Today", "Yesterday", "Last 7 Days", "This Month", "Custom"].map(
          (d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-3 py-1 rounded-lg ${
                dateFilter === d ? "bg-black text-white" : "bg-white border"
              }`}
            >
              {d}
            </button>
          )
        )}
      </div>

      {/* CUSTOM RANGE */}
      {dateFilter === "Custom" && (
        <div className="flex gap-3 mb-6">
          <input
            type="date"
            value={rangeStart}
            className="border px-3 py-2 rounded-lg"
            onChange={(e) => setRangeStart(e.target.value)}
          />
          <input
            type="date"
            value={rangeEnd}
            className="border px-3 py-2 rounded-lg"
            onChange={(e) => setRangeEnd(e.target.value)}
          />
        </div>
      )}

      {/* ORDERS LIST */}
      <div className="grid md:grid-cols-2 gap-5">
        {filteredOrders.map((order) => (
          <div key={order.id} className="p-5 rounded-xl shadow-md border bg-white">
            <div className="flex justify-between items-center mb-2">
<p className="font-semibold text-lg">#{order.orderId || order.id}</p>
              <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-gray-100">
                {order.status}
              </span>
            </div>

            <p className="text-sm">👤 {order.customer_name}</p>
            <p className="text-sm">📍 {order.address}</p>
            <p className="text-sm">
              Total: <strong>₹{order.total}</strong>
            </p>

            <p className="mt-2 text-sm">
              AWB:{" "}
              <strong>{order.awbCode ? order.awbCode : "Not Generated"}</strong>
            </p>

            {order.awbCode && (
              <a
                href={order.trackingUrl}
                target="_blank"
                className="text-blue-600 underline text-sm"
              >
                Track Shipment
              </a>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-4">
              {!order.awbCode && order.status !== "Cancelled" && (
                <button
                  onClick={() => handleCreateShipment(order)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
                >
                  <MdLocalShipping size={18} />
                  {loadingId === order.id ? "..." : "Create Shipment"}
                </button>
              )}

              <button
                onClick={() => handlePrintLabel(order)}
                className="flex items-center gap-1 border px-4 py-2 rounded-lg"
              >
                <MdPrint size={18} /> Label
              </button>

              <button
                onClick={() => remove(ref(db, `orders/${order.userId}/${order.id}`))}
                className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                <MdDelete size={18} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CANCEL REQUESTS */}
      <h2 className="text-xl font-semibold mt-10 mb-3">Cancel Requests</h2>

      <div className="space-y-3">
        {cancelRequests.length === 0 && <p>No cancel requests.</p>}

        {cancelRequests.map(({ userId, orderId, req }) => (
          <div
            key={orderId}
            className="p-4 border bg-white rounded-lg shadow-md flex justify-between"
          >
            <div>
              <p className="font-semibold">Order: {req.orderId}</p>
              <p className="text-sm text-gray-600">Reason: {req.reason}</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleApproveCancel(userId, orderId)}
                className="bg-green-600 text-white px-3 py-1 rounded-lg"
              >
                Approve
              </button>

              <button
                onClick={() => handleDenyCancel(userId, orderId)}
                className="border px-3 py-1 rounded-lg"
              >
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-10 mb-3">Return Requests</h2>

{returnRequests.map(({ userId, orderId, req }) => (
  <div key={orderId} className="p-4 border bg-white rounded-lg shadow flex justify-between">
    <div>
      <p className="font-semibold">Order: {orderId}</p>
      <p className="text-sm text-gray-600">Reason: {req.reason}</p>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => handleApproveReturn(userId, orderId)}
        className="bg-green-600 text-white px-3 py-1 rounded-lg"
      >
        Approve
      </button>

      <button
        onClick={() => handleRejectReturn(userId, orderId)}
        className="border px-3 py-1 rounded-lg"
      >
        Reject
      </button>
    </div>
  </div>
))}

    </div>
  );
}
