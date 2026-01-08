import React, { useState, useEffect } from "react";

export default function Keychainsproduts() {
  const FIREBASE_BASE = "https://stuvely-data-default-rtdb.firebaseio.com";
  const FIREBASE_URL = `${FIREBASE_BASE}/keychains.json`;

  const emptyKeychain = {
    name: "",
    price: "",
    image: "",
    gallery: ["", "", ""],
    description: "",
    highlights: [""],
    specs: { color: "", size: "", dimensions: "", weight: "" },
    externalStores: {
      flipkart: "", amazon: "", shopify: "", ajio: "", myntra: "", tatacliq: "",
      nykaa: "", meesho: "", snapdeal: "", paytmmall: "", firstcry: ""
    }
  };

  const [car, setCar] = useState(emptyKeychain);
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
        setCarList(arr.reverse());
      } else {
        setCarList([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch keychains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  const resetForm = () => {
    setCar(emptyKeychain);
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!car.name || !car.price) return alert("Please enter name and price.");

    try {
      const url = editId ? `${FIREBASE_BASE}/keychains/${editId}.json` : FIREBASE_URL;
      const method = editId ? "PATCH" : "POST";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(car)
      });

      alert(editId ? "✅ Keychain Updated!" : "✅ Keychain Added!");
      resetForm();
      fetchCars();
    } catch (err) {
      console.error(err);
      alert("Operation failed.");
    }
  };

  const handleEdit = (item) => {
    const prepared = {
      ...emptyKeychain,
      ...item,
      gallery: item.gallery?.length ? item.gallery : [""],
      highlights: item.highlights?.length ? item.highlights : [""],
      specs: { ...emptyKeychain.specs, ...(item.specs || {}) },
      externalStores: { ...emptyKeychain.externalStores, ...(item.externalStores || {}) }
    };
    setCar(prepared);
    setEditId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this keychain?")) return;
    try {
      await fetch(`${FIREBASE_BASE}/keychains/${id}.json`, { method: "DELETE" });
      alert("🗑️ Keychain Deleted");
      fetchCars();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // Helpers for nested fields
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
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Manage Keychains</h1>

        <div className="flex justify-between items-center mb-4">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
            >
              + Add Keychain
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
            <h2 className="text-2xl font-semibold mb-4">{editId ? "Edit Keychain" : "Add New Keychain"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                placeholder="Keychain Name"
                value={car.name}
                onChange={(e) => setCar({ ...car, name: e.target.value })}
                className="w-full border p-3 rounded-md"
              />
              <input
                required
                placeholder="Price"
                value={car.price}
                onChange={(e) => setCar({ ...car, price: e.target.value })}
                className="w-full border p-3 rounded-md"
              />
              <input
                placeholder="Main Image URL"
                value={car.image}
                onChange={(e) => setCar({ ...car, image: e.target.value })}
                className="w-full border p-3 rounded-md"
              />
              {car.image && (
                <img src={car.image} alt="Preview" className="w-full h-48 object-cover rounded-md border" />
              )}

              <textarea
                placeholder="Description"
                value={car.description}
                onChange={(e) => setCar({ ...car, description: e.target.value })}
                className="w-full border p-3 rounded-md h-24"
              />

              {/* Gallery */}
              <div>
                <label className="block font-medium mb-2">Gallery Images</label>
                <div className="space-y-2">
                  {car.gallery.map((g, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder={`Gallery Image ${i + 1}`}
                        value={g}
                        onChange={(e) => updateGalleryItem(i, e.target.value)}
                        className="flex-1 border p-2 rounded-md"
                      />
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

              {/* Highlights */}
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

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Color" value={car.specs.color} onChange={(e) => updateSpec("color", e.target.value)} className="border p-2 rounded-md" />
                <input placeholder="Size" value={car.specs.size} onChange={(e) => updateSpec("size", e.target.value)} className="border p-2 rounded-md" />
                <input placeholder="Dimensions" value={car.specs.dimensions} onChange={(e) => updateSpec("dimensions", e.target.value)} className="border p-2 rounded-md" />
                <input placeholder="Weight" value={car.specs.weight} onChange={(e) => updateSpec("weight", e.target.value)} className="border p-2 rounded-md" />
              </div>

              {/* External Stores */}
              <details className="mb-2">
                <summary className="cursor-pointer text-sm text-gray-600">Add external store links</summary>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {Object.keys(car.externalStores).map((key) => (
                    <input
                      key={key}
                      className="border p-3 rounded-md"
                      placeholder={`${key.charAt(0).toUpperCase() + key.slice(1)} URL`}
                      value={car.externalStores[key]}
                      onChange={(e) => updateStore(key, e.target.value)}
                    />
                  ))}
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
          <h3 className="text-xl font-semibold">Keychains</h3>
          {loading && <div className="text-gray-500">Loading...</div>}
          {!loading && carList.length === 0 && <div className="text-gray-500">No keychains yet.</div>}

          <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
            {carList.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price}</p>
                  <div className="flex gap-2 flex-wrap my-2">
                  {item.externalStores &&
  Object.keys(item.externalStores).map((key) =>
    item.externalStores[key] && (
      <a
        key={key}
        href={item.externalStores[key]}
        target="_blank"
        rel="noreferrer"
        className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700"
      >
        {key.charAt(0).toUpperCase() + key.slice(1)}
      </a>
    )
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
