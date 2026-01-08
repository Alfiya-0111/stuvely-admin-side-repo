/* Dashboard.jsx  (React 18 + Firebase v9 + Recharts) */
import React, { useEffect, useState, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebaseConfig";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

/* ---------- helper ---------- */
function parseDate(createdAt) {
  if (!createdAt) return null;

  // string date
  if (typeof createdAt === "string") {
    const d = new Date(createdAt);
    return isNaN(d) ? null : d;
  }

  // timestamp number
  if (typeof createdAt === "number") {
    const d = new Date(createdAt);
    return isNaN(d) ? null : d;
  }

  // firebase timestamp object
  if (createdAt.seconds) {
    const d = new Date(createdAt.seconds * 1000);
    return isNaN(d) ? null : d;
  }

  return null;
}

export default function Dashboard() {
  /* ---------- state ---------- */
  const [collections, setCollections] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);

  /* ---------- mount listeners ---------- */
  useEffect(() => {
    const unsubCollections = onValue(ref(db, "ourcollections"), (snap) => {
      if (snap.exists()) {
        const arr = Object.keys(snap.val()).map((id) => ({
          id,
          ...snap.val()[id],
        }));
        setCollections(arr);
      } else {
        setCollections([]);
      }
    });

    const unsubUsers = onValue(ref(db, "users"), (snap) => {
      if (snap.exists()) {
        const arr = Object.keys(snap.val()).map((id) => ({
          id,
          ...snap.val()[id],
        }));
        setUsers(arr);
      } else {
        setUsers([]);
      }
    });

    const unsubReviews = onValue(ref(db, "reviews"), (snap) => {
      setReviews(snap.exists() ? Object.values(snap.val()) : []);
    });

    const unsubOrders = onValue(ref(db, "orders"), (snap) => {
      if (snap.exists()) {
        const arr = Object.keys(snap.val()).map((id) => ({
          id,
          ...snap.val()[id],
        }));
        setOrders(arr);
      } else {
        setOrders([]);
      }
    });

    const unsubWishlist = onValue(ref(db, "wishlist"), (snap) => {
      const flat = [];
      if (snap.exists()) {
        snap.forEach((userSnap) => {
          userSnap.forEach((itemSnap) => {
            flat.push({
              userId: userSnap.key,
              wishlistId: itemSnap.key,
              ...itemSnap.val(),
            });
          });
        });
      }
      setWishlist(flat);
    });

    return () => {
      unsubCollections();
      unsubUsers();
      unsubReviews();
      unsubOrders();
      unsubWishlist();
    };
  }, []);

  /* ---------- derived data ---------- */
  const totalStock = collections.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  );

  const lowStock = collections.filter((p) => Number(p.stock) < 5);

  /* ---------- wishlist enriched ---------- */
  const enrichedWishlist = useMemo(() => {
    const map = new Map(collections.map((p) => [p.id, p]));
    return wishlist.map((w) => {
      const live = map.get(w.id) || {};
      return {
        ...w,
        stock: Number(live.stock || 0),
        price: Number(live.price || 0),
        name: live.name || w.name || "No Name",
        category: live.category || "Other",
      };
    });
  }, [wishlist, collections]);

  /* ---------- top products ---------- */
  const topProducts = [...collections]
    .sort((a, b) => Number(b.stock) - Number(a.stock))
    .slice(0, 5);

  /* ---------- most wished ---------- */
  const mostWished = useMemo(() => {
    const tally = {};
    enrichedWishlist.forEach((w) => {
      if (!w.id) return;
      tally[w.id] = tally[w.id] || { ...w, wished: 0 };
      tally[w.id].wished += 1;
    });
    return Object.values(tally)
      .sort((a, b) => b.wished - a.wished)
      .slice(0, 5);
  }, [enrichedWishlist]);

  /* ---------- monthly users chart ---------- */
  const userChartData = useMemo(() => {
    const monthlyUsers = {};

    users.forEach((u) => {
      const date = parseDate(u.createdAt);
      if (!date) return;

      const month = date.toISOString().slice(0, 7);
      monthlyUsers[month] = (monthlyUsers[month] || 0) + 1;
    });

    return Object.keys(monthlyUsers)
      .sort()
      .map((m) => ({
        month: m,
        users: monthlyUsers[m],
      }));
  }, [users]);

  /* ---------- stock chart ---------- */
  const stockChart = collections.map((p) => ({
    name: p.name || "No Name",
    stock: Number(p.stock || 0),
  }));

  /* ---------- category pie ---------- */
  const catCount = {};
  collections.forEach((p) => {
    const c = p.category || "Other";
    catCount[c] = (catCount[c] || 0) + 1;
  });

  const pieData = Object.keys(catCount).map((c) => ({
    name: c,
    value: catCount[c],
  }));

  const COLORS = ["#FFBB28", "#0088FE", "#00C49F", "#FF4444", "#AA66CC"];

  /* ---------- render ---------- */
  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        Advanced Analytics Dashboard
      </h1>

      {/* summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card title="Products" value={collections.length} />
        <Card title="Users" value={users.length} />
        <Card title="Reviews" value={reviews.length} />
        <Card title="Wishlist Items" value={enrichedWishlist.length} />
        <Card title="Total Stock" value={totalStock} />
      </div>

      {/* charts */}
      <ChartBox title="Stock Overview">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </ChartBox>

      <ChartBox title="User Registrations (Monthly)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#FF5733"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartBox>

      <ChartBox title="Product Categories">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={120}
              dataKey="value"
              label
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartBox>

      {/* users table */}
      <Section title="Registered Users">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const d = parseDate(u.createdAt);
              return (
                <tr key={u.id} className="border-b">
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{d ? d.toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

/* ---------- UI components ---------- */
function Card({ title, value }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ChartBox({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
