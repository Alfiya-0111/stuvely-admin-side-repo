import React, { useState, useEffect } from "react";
const IMGBB_API_KEY = "0a20bc1e3b35864b35f589679aa50b0d";

const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  return data.data.url;
};

export default function Carproduct() {
  const FIREBASE_BASE = "https://stuvely-data-default-rtdb.firebaseio.com";
  const FIREBASE_URL = `${FIREBASE_BASE}/cars.json`;

  const emptyCar = {
    name: "",
    shortDescription: "",
    price: "",
    image: "",
    gallery: [""],
    highlights: [""],
    description: "",
    specs: {
      color: "",
      size: "",
      dimensions: "",
      weight: "",
    },
    externalStores: {
      flipkart: "",
      amazon: "",
      shopify: "",
      ajio: "",
    },
  };

  const [car, setCar] = useState(emptyCar);
  const [carList, setCarList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch(FIREBASE_URL);
      const data = await res.json();
      if (data) {
        const arr = Object.keys(data).map((k) => ({ id: k, ...data[k] }));
        setCarList(arr.reverse()); // newest first
      } else {
        setCarList([]);
      }
    } catch (err) {
      console.error("fetchCars err:", err);
      alert("Failed to fetch cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const resetForm = () => {
    setCar(emptyCar);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!car.name || !car.price) return alert("Please enter name and price.");

    try {
      const url = editId
        ? `${FIREBASE_BASE}/cars/${editId}.json`
        : FIREBASE_URL;

      const method = editId ? "PATCH" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car),
      });

      alert(editId ? "🚗 Car Updated!" : "✅ Car Added!");
      resetForm();
      fetchCars();
    } catch (err) {
      console.error("submit err:", err);
      alert("Operation failed.");
    }
  };

  const handleEdit = (item) => {
    // ensure gallery/highlights/specs/externalStores have default structure
    const prepared = {
      ...emptyCar,
      ...item,
      gallery: item.gallery && item.gallery.length ? item.gallery : [""],
      highlights: item.highlights && item.highlights.length ? item.highlights : [""],
      specs: { ...emptyCar.specs, ...(item.specs || {}) },
      externalStores: { ...emptyCar.externalStores, ...(item.externalStores || {}) },
    };
    setCar(prepared);
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this car?")) return;
    try {
      await fetch(`${FIREBASE_BASE}/cars/${id}.json`, { method: "DELETE" });
      alert("🗑️ Car Deleted");
      fetchCars();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  /* helpers to update nested fields */
  const updateGalleryItem = (index, value) => {
    const g = [...car.gallery];
    g[index] = value;
    setCar({ ...car, gallery: g });
  };
  const addGallery = () => setCar({ ...car, gallery: [...car.gallery, ""] });
  const removeGallery = (i) => {
    const g = car.gallery.filter((_, idx) => idx !== i);
    setCar({ ...car, gallery: g.length ? g : [""] });
  };

  const updateHighlight = (index, value) => {
    const h = [...car.highlights];
    h[index] = value;
    setCar({ ...car, highlights: h });
  };
  const addHighlight = () => setCar({ ...car, highlights: [...car.highlights, ""] });
  const removeHighlight = (i) => {
    const h = car.highlights.filter((_, idx) => idx !== i);
    setCar({ ...car, highlights: h.length ? h : [""] });
  };

  const updateSpec = (key, value) =>
    setCar({ ...car, specs: { ...car.specs, [key]: value } });

  const updateStore = (key, value) =>
    setCar({ ...car, externalStores: { ...car.externalStores, [key]: value } });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Manage Cars 🚘</h1>

        <div className="flex justify-between items-center mb-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
            >
              + Add Car
            </button>
          )}
          {showForm && (
            <button onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-md">
              Cancel
            </button>
          )}
          <button onClick={fetchCars} className="px-4 py-2 bg-gray-100 rounded-md">
            Refresh
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">{editId ? "Edit Car" : "Add New Car"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Car Name"
                value={car.name}
                onChange={(e) => setCar({ ...car, name: e.target.value })}
                className="w-full border p-3 rounded-md"
              />
              <input
                required
                placeholder="Price (numbers only)"
                value={car.price}
                onChange={(e) => setCar({ ...car, price: e.target.value })}
                className="w-full border p-3 rounded-md"
              />
              <input
                placeholder="Short Description / Tagline"
                value={car.shortDescription}
                onChange={(e) => setCar({ ...car, shortDescription: e.target.value })}
                className="w-full border p-3 rounded-md"
              />

             <input
  type="file"
  accept="image/*"
  className="w-full border p-3 rounded-md"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToImgBB(file);
    setCar({ ...car, image: url });
  }}
/>

{car.image && (
  <img
    src={car.image}
    alt="Preview"
    className="w-full h-48 object-cover rounded-md border mt-2"
  />
)}


              <div>
                <label className="block font-medium mb-2">Gallery Images</label>
                <div className="space-y-2">
                  {car.gallery.map((g, i) => (
                    <div key={i} className="flex gap-2">
                    <input
  type="file"
  accept="image/*"
  className="flex-1 border p-2 rounded-md"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadToImgBB(file);
    updateGalleryItem(i, url);
  }}
/>

{g && (
  <img
    src={g}
    alt={`Gallery ${i}`}
    className="h-20 w-20 object-cover rounded border"
  />
)}

                      <button
                        type="button"
                        onClick={() => removeGallery(i)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addGallery} className="px-3 py-2 bg-gray-200 rounded-md">
                    + Add Gallery Image
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Highlights / Key Features</label>
                <div className="space-y-2">
                  {car.highlights.map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder={`Highlight ${i + 1}`}
                        value={h}
                        onChange={(e) => updateHighlight(i, e.target.value)}
                        className="flex-1 border p-2 rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(i)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addHighlight} className="px-3 py-2 bg-gray-200 rounded-md">
                    + Add Highlight
                  </button>
                </div>
              </div>

              <textarea
                placeholder="Detailed Description"
                value={car.description}
                onChange={(e) => setCar({ ...car, description: e.target.value })}
                className="w-full border p-3 rounded-md h-28"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Color"
                  value={car.specs.color}
                  onChange={(e) => updateSpec("color", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Size"
                  value={car.specs.size}
                  onChange={(e) => updateSpec("size", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Dimensions"
                  value={car.specs.dimensions}
                  onChange={(e) => updateSpec("dimensions", e.target.value)}
                  className="border p-2 rounded-md"
                />
                <input
                  placeholder="Weight"
                  value={car.specs.weight}
                  onChange={(e) => updateSpec("weight", e.target.value)}
                  className="border p-2 rounded-md"
                />
              </div>

              <details className="mb-2">
                <summary className="cursor-pointer text-sm text-gray-600">Add external store links</summary>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <input
                    className="border p-3 rounded-md"
                    placeholder="Flipkart URL"
                    value={car.externalStores.flipkart}
                    onChange={(e) => updateStore("flipkart", e.target.value)}
                  />
                  <input
                    className="border p-3 rounded-md"
                    placeholder="Amazon URL"
                    value={car.externalStores.amazon}
                    onChange={(e) => updateStore("amazon", e.target.value)}
                  />
                  <input
                    className="border p-3 rounded-md"
                    placeholder="Shopify URL"
                    value={car.externalStores.shopify}
                    onChange={(e) => updateStore("shopify", e.target.value)}
                  />
                  <input
                    className="border p-3 rounded-md"
                    placeholder="Ajio URL"
                    value={car.externalStores.ajio}
                    onChange={(e) => updateStore("ajio", e.target.value)}
                  />
                </div>
              </details>

              <div className="flex justify-end gap-3">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-300 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  {editId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products list */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Products</h3>
          {loading && <div className="text-gray-500">Loading...</div>}
          {!loading && carList.length === 0 && <div className="text-gray-500">No products yet.</div>}

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
            {carList.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                  <div className="flex gap-2 flex-wrap my-2">
                    {item.externalStores?.flipkart && (
                      <a href={item.externalStores.flipkart} target="_blank" rel="noreferrer" className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Flipkart
                      </a>
                    )}
                    {item.externalStores?.amazon && (
                      <a href={item.externalStores.amazon} target="_blank" rel="noreferrer" className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        Amazon
                      </a>
                    )}
                    {item.externalStores?.shopify && (
                      <a href={item.externalStores.shopify} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Shopify
                      </a>
                    )}
                    {item.externalStores?.ajio && (
                      <a href={item.externalStores.ajio} target="_blank" rel="noreferrer" className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded">
                        Ajio
                      </a>
                    )}
                  </div>

                  <div className="flex justify-between mt-3">
                    <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-3 py-1 rounded-md">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white px-3 py-1 rounded-md">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
