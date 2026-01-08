import React, { useEffect, useState } from "react";

const BASE_URL = "https://stuvely-data-default-rtdb.firebaseio.com";

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [editingCollectionId, setEditingCollectionId] = useState(null);

  const [collectionForm, setCollectionForm] = useState({
    name: "",
    imageUrl: "",
  });

  /* ---------------- PRODUCT STATE (SAME AS CARPRODUCT) ---------------- */
  const emptyProduct = {
    collectionId: "",
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

  const [productData, setProductData] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);

  /* ---------------- FETCH COLLECTIONS ---------------- */
  const fetchCollections = async () => {
    const res = await fetch(`${BASE_URL}/ourcollections.json`);
    const data = await res.json();

    if (data) {
      const arr = Object.keys(data).map((id) => ({
        id,
        ...data[id],
      }));
      setCollections(arr);
    } else {
      setCollections([]);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const slugify = (text) =>
    text.trim().toLowerCase().replace(/\s+/g, "-");

  /* ---------------- COLLECTION CRUD ---------------- */
  const handleCollectionSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...collectionForm,
      slug: slugify(collectionForm.name),
      products:
        editingCollectionId
          ? collections.find((c) => c.id === editingCollectionId)?.products || {}
          : {},
    };

    const url = editingCollectionId
      ? `${BASE_URL}/ourcollections/${editingCollectionId}.json`
      : `${BASE_URL}/ourcollections.json`;

    await fetch(url, {
      method: editingCollectionId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    alert(editingCollectionId ? "Collection Updated" : "Collection Added");
    setCollectionForm({ name: "", imageUrl: "" });
    setEditingCollectionId(null);
    fetchCollections();
  };

  const deleteCollection = async (id) => {
    if (!window.confirm("Delete collection?")) return;
    await fetch(`${BASE_URL}/ourcollections/${id}.json`, { method: "DELETE" });
    fetchCollections();
  };

  /* ---------------- PRODUCT CRUD ---------------- */
  const handleProductSubmit = async (e) => {
    e.preventDefault();

    if (!productData.collectionId) {
      alert("Select collection");
      return;
    }

    const url = editingProductId
      ? `${BASE_URL}/ourcollections/${productData.collectionId}/products/${editingProductId}.json`
      : `${BASE_URL}/ourcollections/${productData.collectionId}/products.json`;

    await fetch(url, {
      method: editingProductId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    });

    alert(editingProductId ? "Product Updated" : "Product Added");
    resetProductForm();
    fetchCollections();
  };

  const resetProductForm = () => {
    setProductData(emptyProduct);
    setEditingProductId(null);
  };

  const editProduct = (colId, pid, p) => {
    setProductData({
      collectionId: colId,
      ...emptyProduct,
      ...p,
      gallery: p.gallery?.length ? p.gallery : [""],
      highlights: p.highlights?.length ? p.highlights : [""],
      specs: { ...emptyProduct.specs, ...(p.specs || {}) },
      externalStores: {
        ...emptyProduct.externalStores,
        ...(p.externalStores || {}),
      },
    });
    setEditingProductId(pid);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (colId, pid) => {
    if (!window.confirm("Delete product?")) return;
    await fetch(
      `${BASE_URL}/ourcollections/${colId}/products/${pid}.json`,
      { method: "DELETE" }
    );
    fetchCollections();
  };

  /* ---------------- HELPERS ---------------- */
 const updateGallery = (index, value) => {
  const newGallery = [...productData.gallery];
  newGallery[index] = value;
  setProductData({ ...productData, gallery: newGallery });
};

const addGalleryImage = () => {
  setProductData({
    ...productData,
    gallery: [...productData.gallery, ""],
  });
};

const removeGalleryImage = (index) => {
  const newGallery = productData.gallery.filter((_, i) => i !== index);
  setProductData({
    ...productData,
    gallery: newGallery.length ? newGallery : [""],
  });
};


  const updateHighlight = (i, val) => {
    const h = [...productData.highlights];
    h[i] = val;
    setProductData({ ...productData, highlights: h });
  };

  const updateSpec = (key, val) =>
    setProductData({
      ...productData,
      specs: { ...productData.specs, [key]: val },
    });

  const updateStore = (key, val) =>
    setProductData({
      ...productData,
      externalStores: { ...productData.externalStores, [key]: val },
    });

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen overflow-y-auto">

      {/* COLLECTION FORM */}
      <div className="bg-white p-5 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {editingCollectionId ? "Edit Collection" : "Add Collection"}
        </h2>

        <form onSubmit={handleCollectionSubmit} className="grid gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Collection Name"
            value={collectionForm.name}
            onChange={(e) =>
              setCollectionForm({ ...collectionForm, name: e.target.value })
            }
            required
          />
          <input
            className="border p-2 rounded"
            placeholder="Collection Image URL"
            value={collectionForm.imageUrl}
            onChange={(e) =>
              setCollectionForm({
                ...collectionForm,
                imageUrl: e.target.value,
              })
            }
            required
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded w-max">
            {editingCollectionId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* PRODUCT FORM */}
      <div className="bg-white p-5 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {editingProductId ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleProductSubmit} className="grid gap-3">

          <select
            className="border p-2 rounded"
            value={productData.collectionId}
            onChange={(e) =>
              setProductData({ ...productData, collectionId: e.target.value })
            }
            required
          >
            <option value="">Select Collection</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            className="border p-2 rounded"
            placeholder="Product Name"
            value={productData.name}
            onChange={(e) =>
              setProductData({ ...productData, name: e.target.value })
            }
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Short Description"
            value={productData.shortDescription}
            onChange={(e) =>
              setProductData({
                ...productData,
                shortDescription: e.target.value,
              })
            }
          />

          <input
            className="border p-2 rounded"
            placeholder="Price"
            value={productData.price}
            onChange={(e) =>
              setProductData({ ...productData, price: e.target.value })
            }
            required
          />

          <input
            className="border p-2 rounded"
            placeholder="Main Image URL"
            value={productData.image}
            onChange={(e) =>
              setProductData({ ...productData, image: e.target.value })
            }
          />
          {/* ---------- GALLERY IMAGES ---------- */}
<div>
  <label className="block font-medium mb-2">
    Gallery Images (URLs)
  </label>

  <div className="space-y-2">
    {productData.gallery.map((img, i) => (
      <div key={i} className="flex gap-2 items-center">
        <input
          className="flex-1 border p-2 rounded"
          placeholder={`Gallery Image ${i + 1} URL`}
          value={img}
          onChange={(e) => updateGallery(i, e.target.value)}
        />

        {img && (
          <img
            src={img}
            alt="preview"
            className="w-14 h-14 object-cover rounded border"
          />
        )}

        <button
          type="button"
          onClick={() => removeGalleryImage(i)}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Remove
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={addGalleryImage}
      className="px-3 py-1 bg-gray-200 rounded text-sm"
    >
      + Add Image
    </button>
  </div>
</div>


          <textarea
            className="border p-2 rounded"
            placeholder="Description"
            value={productData.description}
            onChange={(e) =>
              setProductData({
                ...productData,
                description: e.target.value,
              })
            }
          />

          {/* SPECS */}
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(productData.specs).map((k) => (
              <input
                key={k}
                className="border p-2 rounded"
                placeholder={k}
                value={productData.specs[k]}
                onChange={(e) => updateSpec(k, e.target.value)}
              />
            ))}
          </div>
{/* -----------  Highlights / Key Features  ----------- */}
<div>
  <label className="block font-medium mb-2">Highlights / Key Features</label>
  <div className="space-y-2">
    {productData.highlights.map((h, i) => (
      <div key={i} className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded"
          placeholder={`Highlight ${i + 1}`}
          value={h}
          onChange={(e) => updateHighlight(i, e.target.value)}
        />
        <button
          type="button"
          onClick={() => {
            const arr = productData.highlights.filter((_, idx) => idx !== i);
            setProductData({ ...productData, highlights: arr.length ? arr : [""] });
          }}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Remove
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() =>
        setProductData({ ...productData, highlights: [...productData.highlights, ""] })
      }
      className="px-3 py-1 bg-gray-200 rounded text-sm"
    >
      + Add Highlight
    </button>
  </div>
</div>
          {/* STORES */}
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(productData.externalStores).map((k) => (
              <input
                key={k}
                className="border p-2 rounded"
                placeholder={`${k} URL`}
                value={productData.externalStores[k]}
                onChange={(e) => updateStore(k, e.target.value)}
              />
            ))}
          </div>

          <button className="bg-green-600 text-white px-4 py-2 rounded w-max">
            {editingProductId ? "Update Product" : "Add Product"}
          </button>
        </form>
      </div>

      {/* LIST */}
      {collections.map((col) => (
        <div key={col.id} className="bg-white p-4 rounded shadow mb-4">
         <div className="flex justify-between mb-3 items-center">
  <div className="flex items-center gap-3">
    {/* ➜ Collection image */}
    {col.imageUrl && (
      <img
        src={col.imageUrl}
        alt={col.name}
        className="w-16 h-16 object-cover rounded-md border"
      />
    )}
    <h3 className="font-semibold text-lg">{col.name}</h3>
  </div>

  <button
    className="text-red-600 text-sm"
    onClick={() => deleteCollection(col.id)}
  >
    Delete
  </button>
</div>

      {col.products &&
  Object.entries(col.products).map(([pid, p]) => {
    const img = p.image || p.imageUrl;   // ← fallback added
    return (
      <div
        key={pid}
        className="flex items-center justify-between border p-3 rounded mb-2 gap-3"
      >
        <div className="flex items-center gap-3">
          {img && (
            <img
              src={img}
              alt={p.name}
              className="w-14 h-14 object-cover rounded border"
            />
          )}

          <div>
            <p className="font-semibold">{p.name}</p>
            <p className="text-sm text-gray-600">₹{p.price}</p>
            {p.shortDescription && (
              <p className="text-xs text-gray-500">{p.shortDescription}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-yellow-400 rounded text-xs"
            onClick={() => editProduct(col.id, pid, p)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded text-xs"
            onClick={() => deleteProduct(col.id, pid)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  })}


        </div>
      ))}
    </div>
  );
}
