import React, { useState, useEffect } from "react";

const FIREBASE_DB_URL = "https://stuvely-data-default-rtdb.firebaseio.com/bestdeals.json";

export default function BestDealsAdmin() {
  const [offers, setOffers] = useState([]);
  const [editingOfferId, setEditingOfferId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [newHighlight, setNewHighlight] = useState("");

  const [offerForm, setOfferForm] = useState({ title: "", slug: "", bgImage: "" });
  const [productForm, setProductForm] = useState({
    offerId: "",
    name: "",
    price: "",
    offer: "",
    imageUrl: "",
    description: "",
    gallery: [],
    variants: [],
    flipkart: "",
    amazon: "",
    shopify: "",
    ajio: "",
    highlights: "",
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const res = await fetch(FIREBASE_DB_URL);
      const data = await res.json();
      if (!data) return setOffers([]);
      setOffers(Object.entries(data).map(([id, val]) => ({ id, ...val })));
    } catch (err) {
      console.error(err);
    }
  };

  const generateSlug = (name) => name.trim().toLowerCase().replace(/\s+/g, "-");

  // ===== Offer Handlers =====
  const saveOffer = async () => {
    if (!offerForm.title || !offerForm.slug) return alert("Title & Slug required!");
    const slug = generateSlug(offerForm.slug);

    try {
      if (editingOfferId) {
        await fetch(`${FIREBASE_DB_URL.replace(".json", "")}/${editingOfferId}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...offerForm, slug }),
        });
        setEditingOfferId(null);
      } else {
        await fetch(FIREBASE_DB_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...offerForm, slug, products: {} }),
        });
      }
      setOfferForm({ title: "", slug: "", bgImage: "" });
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await fetch(`${FIREBASE_DB_URL.replace(".json", "")}/${id}.json`, { method: "DELETE" });
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  // ===== Product Handlers =====
  const saveProduct = async () => {
    const { offerId, name, price } = productForm;
    if (!offerId || !name || !price) return alert("Offer, Name & Price required!");

    const galleryNormalized = (productForm.gallery || []).map((g) =>
      typeof g === "string" ? { type: "image", url: g } : g
    );

    const prodBody = { ...productForm, gallery: galleryNormalized };

    try {
      if (editingProductId) {
        await fetch(`${FIREBASE_DB_URL.replace(".json", "")}/${offerId}/products/${editingProductId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prodBody),
        });
        setEditingProductId(null);
      } else {
        await fetch(`${FIREBASE_DB_URL.replace(".json", "")}/${offerId}/products.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prodBody),
        });
      }
      setProductForm({
        offerId: "", name: "", price: "", offer: "", imageUrl: "", description: "", gallery: [], variants: [],
        flipkart: "", amazon: "", shopify: "", ajio: "", highlights: "",
      });
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteProduct = async (offerId, productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await fetch(`${FIREBASE_DB_URL.replace(".json", "")}/${offerId}/products/${productId}.json`, { method: "DELETE" });
      loadOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const addVariant = () => {
    setProductForm({ ...productForm, variants: [...(productForm.variants || []), { color: "", size: "", stock: "" }] });
  };

  const addGalleryItem = () => {
    setProductForm({ ...productForm, gallery: [...(productForm.gallery || []), { type: "image", url: "" }] });
  };

  const updateGalleryItem = (i, field, value) => {
    const newGallery = [...(productForm.gallery || [])];
    newGallery[i][field] = value;
    setProductForm({ ...productForm, gallery: newGallery });
  };

  const removeGalleryItem = (i) => {
    const newGallery = [...(productForm.gallery || [])];
    newGallery.splice(i, 1);
    setProductForm({ ...productForm, gallery: newGallery });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Best Deals Admin</h1>

      {/* ===== Offer Form ===== */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">{editingOfferId ? "Edit Offer" : "Add Offer"}</h2>
        <input placeholder="Title" className="border p-2 mb-2 w-full" value={offerForm.title} onChange={e => setOfferForm({ ...offerForm, title: e.target.value })} />
        <input placeholder="Slug" className="border p-2 mb-2 w-full" value={offerForm.slug} onChange={e => setOfferForm({ ...offerForm, slug: e.target.value })} />
        <input placeholder="Background Image URL" className="border p-2 mb-2 w-full" value={offerForm.bgImage} onChange={e => setOfferForm({ ...offerForm, bgImage: e.target.value })} />
        <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={saveOffer}>{editingOfferId ? "Update Offer" : "Add Offer"}</button>
      </div>

      {/* ===== Product Form ===== */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">{editingProductId ? "Edit Product" : "Add Product"}</h2>

        <select className="border p-2 mb-2 w-full" value={productForm.offerId} onChange={e => setProductForm({ ...productForm, offerId: e.target.value })}>
          <option value="">Select Offer</option>
          {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
        </select>

        <input placeholder="Name" className="border p-2 mb-2 w-full" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
        <input placeholder="Price" type="number" className="border p-2 mb-2 w-full" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
        <input placeholder="Offer (%)" type="number" className="border p-2 mb-2 w-full" value={productForm.offer} onChange={e => setProductForm({ ...productForm, offer: e.target.value })} />
        <input placeholder="Main Image URL" className="border p-2 mb-2 w-full" value={productForm.imageUrl} onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })} />
        <input placeholder="Description" className="border p-2 mb-2 w-full" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} />
      
      
<div className="border p-2 mb-2 rounded">
  <h3 className="font-semibold mb-2">Highlights</h3>

  {/* Existing Highlights Array Display */}
  <div className="flex flex-wrap gap-2 mb-2">
    {(productForm.highlights || []).map((h, i) => (
      <span key={i} className="bg-yellow-200 px-2 py-1 rounded flex items-center gap-1">
        {h}
        <button
          type="button"
          className="text-red-500 font-bold"
          onClick={() => {
            const updated = [...productForm.highlights];
            updated.splice(i, 1);
            setProductForm({ ...productForm, highlights: updated });
          }}
        >
          ×
        </button>
      </span>
    ))}
  </div>

  {/* Add New Highlight */}
  <div className="flex gap-2">
    <input
      placeholder="Enter highlight"
      className="border p-2 flex-1"
      value={newHighlight}
      onChange={e => setNewHighlight(e.target.value)}
    />
    <button
      type="button"
      className="bg-blue-500 text-white px-3 py-1 rounded"
      onClick={() => {
        if (!newHighlight.trim()) return;
        const updated = [...(productForm.highlights || []), newHighlight.trim()];
        setProductForm({ ...productForm, highlights: updated });
        setNewHighlight("");
      }}
    >
      + Add Highlight
    </button>
  </div>
</div>
        {/* Variants */}
        <div className="border p-2 mb-2 rounded">
          <h3 className="font-semibold mb-2">Variants</h3>
          {(productForm.variants || []).map((v, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input placeholder="Color" value={v.color} onChange={e => { const newV = [...productForm.variants]; newV[i].color = e.target.value; setProductForm({ ...productForm, variants: newV }); }} className="border p-1 flex-1" />
              <input placeholder="Size" value={v.size} onChange={e => { const newV = [...productForm.variants]; newV[i].size = e.target.value; setProductForm({ ...productForm, variants: newV }); }} className="border p-1 flex-1" />
              <input placeholder="Stock" type="number" value={v.stock} onChange={e => { const newV = [...productForm.variants]; newV[i].stock = e.target.value; setProductForm({ ...productForm, variants: newV }); }} className="border p-1 w-20" />
            </div>
          ))}
          <button type="button" className="bg-blue-500 text-white px-3 py-1 rounded" onClick={addVariant}>+ Add Variant</button>
        </div>

        {/* Gallery */}
        <div className="border p-2 mb-2 rounded">
          <h3 className="font-semibold mb-2">Gallery</h3>
          {(productForm.gallery || []).map((g, i) => (
            <div key={i} className="flex gap-2 items-center mb-2">
              <select value={g.type} onChange={e => updateGalleryItem(i, "type", e.target.value)} className="border p-1">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <input placeholder="URL" className="border p-1 flex-1" value={g.url} onChange={e => updateGalleryItem(i, "url", e.target.value)} />
              <button type="button" className="bg-red-400 text-white px-2 py-1 rounded" onClick={() => removeGalleryItem(i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="bg-green-500 text-white px-3 py-1 rounded" onClick={addGalleryItem}>+ Add Gallery Item</button>
        </div>

        <button className="px-4 py-2 bg-green-600 text-white rounded" onClick={saveProduct}>{editingProductId ? "Update Product" : "Add Product"}</button>
      </div>

      {/* ===== Offers & Products List ===== */}
      {offers.map(o => (
        <div key={o.id} className="border p-4 rounded mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">{o.title}</span>
            <div className="flex gap-2">
              <button className="bg-yellow-400 px-2 py-1 rounded" onClick={() => { setEditingOfferId(o.id); setOfferForm({ title: o.title, slug: o.slug, bgImage: o.bgImage }); }}>Edit</button>
              <button className="bg-red-600 px-2 py-1 rounded text-white" onClick={() => deleteOffer(o.id)}>Delete</button>
            </div>
          </div>

          {o.products && Object.entries(o.products).map(([pid, p]) => (
            <div key={pid} className="flex justify-between items-center border p-2 rounded mb-1">
              <div>
                <span>{p.name} - ₹{p.price} {p.offer ? `(${p.offer}%)` : ""}</span>

                {/* external links */}
                <div className="flex gap-2 mt-1">
                  {p.flipkart && <a href={p.flipkart} target="_blank" rel="noreferrer" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Flipkart</a>}
                  {p.amazon && <a href={p.amazon} target="_blank" rel="noreferrer" className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Amazon</a>}
                  {p.shopify && <a href={p.shopify} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Shopify</a>}
                  {p.ajio && <a href={p.ajio} target="_blank" rel="noreferrer" className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Ajio</a>}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="bg-yellow-400 px-2 py-1 rounded" onClick={() => { setEditingProductId(pid); setProductForm({ ...p, offerId: o.id }); }}>Edit</button>
                <button className="bg-red-600 px-2 py-1 rounded text-white" onClick={() => deleteProduct(o.id, pid)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
