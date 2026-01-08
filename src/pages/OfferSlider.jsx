/*  OfferSlider.jsx  –  with 14 e-com platform links  */
import React, { useState, useEffect } from "react";

function OfferSlider() {
  const [sliders, setSliders] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    bgColor: "",
    bgImage: "",
    offerPercent: "",
  });
  const [editingSliderId, setEditingSliderId] = useState(null);

const [productData, setProductData] = useState({
  sliderId: "",
  name: "",
  imageUrl: "",
  videoUrl: "",
  price: "",
  offer: "",
  description: "",

  highlights: [""],
  specs: {
    color: "",
    size: "",
    dimensions: "",
    weight: "",
  },

  variants: [],
  gallery: [],

  flipkart: "",
  amazon: "",
  shopify: "",
  ajio: "",
  myntra: "",
  tatacliq: "",
  nykaa: "",
  meesho: "",
  snapdeal: "",
  paytmmall: "",
  firstcry: "",
});

  const [editingProductId, setEditingProductId] = useState(null);

  // Fetch sliders & products
  const fetchSliders = async () => {
    try {
      const res = await fetch("https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json");
      const data = await res.json();
      if (data) {
        const arr = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
        setSliders(arr);
      } else setSliders([]);
    } catch (err) {
      console.error("fetchSliders error:", err);
      setSliders([]);
    }
  };

  useEffect(() => {
    fetchSliders();
  }, []);

  const generateSlug = (name) => name.trim().toLowerCase().replace(/\s+/g, "-");

  // ---------- Slider handlers ----------
  const handleAddSlider = async (e) => {
    e.preventDefault();
    const slug = generateSlug(formData.title || "untitled");
    try {
      if (editingSliderId) {
        await fetch(`https://stuvely-data-default-rtdb.firebaseio.com/offersliders/${editingSliderId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, slug, products: sliders.find((s) => s.id === editingSliderId)?.products || {} }),
        });
        alert("Slider updated!");
        setEditingSliderId(null);
      } else {
        await fetch("https://stuvely-data-default-rtdb.firebaseio.com/offersliders.json", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, slug, products: {} }),
        });
        alert("Slider added!");
      }
      setFormData({ title: "", subtitle: "", bgColor: "", bgImage: "", offerPercent: "" });
      fetchSliders();
    } catch (err) {
      console.error("handleAddSlider error:", err);
      alert("Failed to save slider.");
    }
  };

  const handleEditSlider = (slider) => {
    setFormData({
      title: slider.title || "",
      subtitle: slider.subtitle || "",
      bgColor: slider.bgColor || "",
      bgImage: slider.bgImage || "",
      offerPercent: slider.offerPercent || "",
    });
    setEditingSliderId(slider.id);
  };

  const handleDeleteSlider = async (id) => {
    if (!window.confirm("Are you sure to delete this slider?")) return;
    try {
      await fetch(`https://stuvely-data-default-rtdb.firebaseio.com/offersliders/${id}.json`, { method: "DELETE" });
      alert("Slider deleted!");
      fetchSliders();
    } catch (err) {
      console.error("handleDeleteSlider error:", err);
      alert("Failed to delete slider.");
    }
  };

  // ---------- Product handlers ----------
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!productData.sliderId) return alert("Select a slider");

    const galleryNormalized = (productData.gallery || []).map((g) =>
      typeof g === "string" ? { type: "image", url: g } : g
    );

    const prodBody = {
      name: productData.name,
      imageUrl: productData.imageUrl || "",
      videoUrl: productData.videoUrl || "",
      price: productData.price,
      offer: productData.offer || null,
      description: productData.description,
       highlights: productData.highlights || [],
  specs: productData.specs || {},
      variants: productData.variants || [],
      gallery: galleryNormalized,
      flipkart: productData.flipkart.trim(), // ✅
      amazon: productData.amazon.trim(),     // ✅
      shopify: productData.shopify.trim(),   // ✅
      ajio: productData.ajio.trim(),         // ✅
      myntra: productData.myntra.trim(),     // ✅
      tatacliq: productData.tatacliq.trim(), // ✅
      nykaa: productData.nykaa.trim(),       // ✅
      meesho: productData.meesho.trim(),     // ✅
      snapdeal: productData.snapdeal.trim(), // ✅
      paytmmall: productData.paytmmall.trim(), // ✅
      firstcry: productData.firstcry.trim(), // ✅
    };

    try {
      if (editingProductId) {
        await fetch(`https://stuvely-data-default-rtdb.firebaseio.com/offersliders/${productData.sliderId}/products/${editingProductId}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prodBody),
        });
        alert("Product updated!");
        setEditingProductId(null);
      } else {
        await fetch(`https://stuvely-data-default-rtdb.firebaseio.com/offersliders/${productData.sliderId}/products.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prodBody),
        });
        alert("Product added!");
      }
     setProductData({
  sliderId: "",
  name: "",
  imageUrl: "",
  videoUrl: "",
  price: "",
  offer: "",
  description: "",

  highlights: [""],
  specs: {
    color: "",
    size: "",
    dimensions: "",
    weight: "",
  },

  variants: [],
  gallery: [],

  flipkart: "",
  amazon: "",
  shopify: "",
  ajio: "",
  myntra: "",
  tatacliq: "",
  nykaa: "",
  meesho: "",
  snapdeal: "",
  paytmmall: "",
  firstcry: "",
});

      fetchSliders();
    } catch (err) {
      console.error("handleAddProduct error:", err);
      alert("Failed to save product.");
    }
  };

const handleEditProduct = (sliderId, prodId, prod) => {
  const galleryNormalized = (prod.gallery || []).map((g) =>
    typeof g === "string" ? { type: "image", url: g } : g
  );

  setProductData({
    sliderId,
    name: prod.name || "",
    imageUrl: prod.imageUrl || "",
    videoUrl: prod.videoUrl || "",
    price: prod.price || "",
    offer: prod.offer || "",
    description: prod.description || "",

    highlights: prod.highlights?.length ? prod.highlights : [""],
    specs: prod.specs || {
      color: "",
      size: "",
      dimensions: "",
      weight: "",
    },

    variants: prod.variants || [],
    gallery: galleryNormalized,

    flipkart: prod.flipkart || "",
    amazon: prod.amazon || "",
    shopify: prod.shopify || "",
    ajio: prod.ajio || "",
    myntra: prod.myntra || "",
    tatacliq: prod.tatacliq || "",
    nykaa: prod.nykaa || "",
    meesho: prod.meesho || "",
    snapdeal: prod.snapdeal || "",
    paytmmall: prod.paytmmall || "",
    firstcry: prod.firstcry || "",
  });

  setEditingProductId(prodId);
  window.scrollTo({ top: 0, behavior: "smooth" });
};


  const handleDeleteProduct = async (sliderId, prodId) => {
    if (!window.confirm("Are you sure to delete this product?")) return;
    try {
      await fetch(`https://stuvely-data-default-rtdb.firebaseio.com/offersliders/${sliderId}/products/${prodId}.json`, { method: "DELETE" });
      alert("Product deleted!");
      fetchSliders();
    } catch (err) {
      console.error("handleDeleteProduct error:", err);
      alert("Failed to delete product.");
    }
  };

  // ---------- Variants & Gallery helpers ----------
  const addVariant = () => {
    setProductData(
      { ...productData,
         variants:
          [...(productData.variants || []),
           { color: "",
             size: "",
              stock: "" }]
             }
            );
  };

  const addGalleryItem = () => {
    setProductData({ ...productData, gallery: [...(productData.gallery || []), { type: "image", url: "" }] });
  };

  const updateGalleryItem = (i, field, value) => {
    const newGallery = [...(productData.gallery || [])];
    newGallery[i] = { ...newGallery[i], [field]: value };
    setProductData({ ...productData, gallery: newGallery });
  };

  const removeGalleryItem = (i) => {
    const newGallery = [...(productData.gallery || [])];
    newGallery.splice(i, 1);
    setProductData({ ...productData, gallery: newGallery });
  };
/* -------- HIGHLIGHTS HELPERS -------- */
const updateHighlight = (i, value) => {
  const arr = [...productData.highlights];
  arr[i] = value;
  setProductData({ ...productData, highlights: arr });
};

const addHighlight = () => {
  setProductData({
    ...productData,
    highlights: [...productData.highlights, ""],
  });
};

const removeHighlight = (i) => {
  const arr = productData.highlights.filter((_, idx) => idx !== i);
  setProductData({
    ...productData,
    highlights: arr.length ? arr : [""],
  });
};

/* -------- SPECS HELPER -------- */
const updateSpec = (key, value) => {
  setProductData({
    ...productData,
    specs: { ...productData.specs, [key]: value },
  });
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Slider Form */}
      <h2 className="text-2xl font-bold mb-3">{editingSliderId ? "Edit Offer Slider" : "Add Offer Slider"}</h2>
      <form onSubmit={handleAddSlider} className="flex flex-col gap-2 mb-6">
        <input required placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Subtitle" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Background Color" value={formData.bgColor} onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Background Image URL" value={formData.bgImage} onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })} className="border p-2 rounded" />
        <input placeholder="Offer %" type="number" value={formData.offerPercent} onChange={(e) => setFormData({ ...formData, offerPercent: e.target.value })} className="border p-2 rounded" />
        <button className="bg-violet-600 text-white p-2 rounded">{editingSliderId ? "Update Slider" : "Add Slider"}</button>
      </form>

      {/* Product Form */}
      <h2 className="text-2xl font-bold mb-3">{editingProductId ? "Edit Product" : "Add Product"}</h2>
      <form onSubmit={handleAddProduct} className="flex flex-col gap-2">
        <select required value={productData.sliderId} onChange={(e) => setProductData({ ...productData, sliderId: e.target.value })} className="border p-2 rounded">
          <option value="">Select Slider</option>
          {sliders.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>

        <input required placeholder="Product Name" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} className="border p-2 rounded" />

        <input placeholder="Product Image URL (main)" value={productData.imageUrl} onChange={(e) => setProductData({ ...productData, imageUrl: e.target.value })} className="border p-2 rounded" />

        <input placeholder="Product Video URL (main, optional)" value={productData.videoUrl} onChange={(e) => setProductData({ ...productData, videoUrl: e.target.value })} className="border p-2 rounded" />

        <input required placeholder="Price" type="number" value={productData.price} onChange={(e) => setProductData({ ...productData, price: e.target.value })} className="border p-2 rounded" />

        <input placeholder="Offer (optional)" type="number" value={productData.offer} onChange={(e) => setProductData({ ...productData, offer: e.target.value })} className="border p-2 rounded" />

        <textarea placeholder="Description" value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} className="border p-2 rounded" />

        {/* --------  E-COMMERCE LINKS  -------- */}
        <details className="mb-2">
          <summary className="cursor-pointer text-sm text-gray-600">Add external store links (14+ platforms)</summary>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <input placeholder="Flipkart URL" value={productData.flipkart} onChange={(e) => setProductData({ ...productData, flipkart: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Amazon URL" value={productData.amazon} onChange={(e) => setProductData({ ...productData, amazon: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Shopify URL" value={productData.shopify} onChange={(e) => setProductData({ ...productData, shopify: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Ajio URL" value={productData.ajio} onChange={(e) => setProductData({ ...productData, ajio: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Myntra URL" value={productData.myntra} onChange={(e) => setProductData({ ...productData, myntra: e.target.value })} className="border p-2 rounded" />
            <input placeholder="TataCliQ URL" value={productData.tatacliq} onChange={(e) => setProductData({ ...productData, tatacliq: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Nykaa URL" value={productData.nykaa} onChange={(e) => setProductData({ ...productData, nykaa: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Meesho URL" value={productData.meesho} onChange={(e) => setProductData({ ...productData, meesho: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Snapdeal URL" value={productData.snapdeal} onChange={(e) => setProductData({ ...productData, snapdeal: e.target.value })} className="border p-2 rounded" />
            <input placeholder="Paytm Mall URL" value={productData.paytmmall} onChange={(e) => setProductData({ ...productData, paytmmall: e.target.value })} className="border p-2 rounded" />
            <input placeholder="FirstCry URL" value={productData.firstcry} onChange={(e) => setProductData({ ...productData, firstcry: e.target.value })} className="border p-2 rounded" />
          </div>
        </details>
{/* -------- HIGHLIGHTS -------- */}
<div className="border p-3 rounded">
  <h4 className="font-semibold mb-2">Highlights</h4>

  {productData.highlights.map((h, i) => (
    <div key={i} className="flex gap-2 mb-2">
      <input
        className="flex-1 border p-2 rounded"
        placeholder={`Highlight ${i + 1}`}
        value={h}
        onChange={(e) => updateHighlight(i, e.target.value)}
      />
      <button
        type="button"
        onClick={() => removeHighlight(i)}
        className="px-3 bg-red-500 text-white rounded"
      >
        ✕
      </button>
    </div>
  ))}

  <button
    type="button"
    onClick={addHighlight}
    className="bg-gray-200 px-3 py-1 rounded text-sm"
  >
    + Add Highlight
  </button>
</div>

        {/* Variants */}
        <div className="border p-3 rounded">
          <h4 className="font-semibold mb-2">Variants</h4>
          {(productData.variants || []).map((v, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className="border p-1 rounded flex-1" placeholder="Color" value={v.color} onChange={(e) => { const newV = [...productData.variants]; newV[i].color = e.target.value; setProductData({ ...productData, variants: newV }); }} />
              <input className="border p-1 rounded" placeholder="Size" value={v.size} onChange={(e) => { const newV = [...productData.variants]; newV[i].size = e.target.value; setProductData({ ...productData, variants: newV }); }} />
              <input className="border p-1 rounded w-20" placeholder="Stock" type="number" value={v.stock} onChange={(e) => { const newV = [...productData.variants]; newV[i].stock = e.target.value; setProductData({ ...productData, variants: newV }); }} />
            </div>
          ))}
          <button type="button" onClick={addVariant} className="bg-blue-500 text-white px-3 py-1 rounded">+ Add Variant</button>
        </div>

        {/* Gallery */}
        <div className="border p-3 rounded mt-3">
          <h4 className="font-semibold mb-2">Gallery (image / video URLs)</h4>
          {(productData.gallery || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select value={item.type} onChange={(e) => updateGalleryItem(i, "type", e.target.value)} className="border p-1 rounded">
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              <input className="flex-1 border p-1 rounded" placeholder={`Enter ${item.type} URL`} value={item.url} onChange={(e) => updateGalleryItem(i, "url", e.target.value)} />
              {item.type === "image" && item.url && <img src={item.url} alt={`preview-${i}`} className="w-16 h-16 object-cover rounded" />}
              {item.type === "video" && item.url && <video src={item.url} className="w-24 h-16 object-cover rounded" controls />}
              <button type="button" onClick={() => removeGalleryItem(i)} className="px-2 py-1 bg-red-400 text-white rounded">Remove</button>
            </div>
          ))}
          <div>
            <button type="button" onClick={addGalleryItem} className="bg-green-500 text-white px-3 py-1 rounded">+ Add Gallery Item</button>
            <p className="text-sm text-gray-500 mt-2">Tip: Paste hosted image/video URLs (mp4 or direct links). These will be saved to Realtime DB.</p>
          </div>
        </div>

        <button className="bg-green-600 text-white p-2 rounded mt-3">{editingProductId ? "Update Product" : "Add Product"}</button>
      </form>

      {/* Existing sliders & products list */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-3">Existing Sliders</h3>
        {sliders.map((slider) => (
          <div key={slider.id} className="border p-3 rounded mb-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                {slider.bgImage && <img src={slider.bgImage} alt="bg" className="w-14 h-14 object-cover rounded" />}
                <div>
                  <div className="font-semibold">{slider.title}</div>
                  <div className="text-sm text-gray-500">{slider.subtitle}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditSlider(slider)} className="px-2 py-1 bg-yellow-400 rounded">Edit</button>
                <button onClick={() => handleDeleteSlider(slider.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>

            {/* products */}
            {slider.products && Object.keys(slider.products).length > 0 && (
              <div className="ml-2">
                {Object.keys(slider.products).map((pid) => {
                  const p = slider.products[pid];
                  return (
                    <div key={pid} className="flex justify-between items-center mb-2 border-t pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <img src={p.imageUrl || (p.gallery && p.gallery[0] && (p.gallery[0].url || p.gallery[0])) || ""} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-sm text-gray-600">₹{p.price} {p.offer ? <span className="text-red-500">({p.offer}%)</span> : null}</div>

                          {/* -------- external links -------- */}
                          <div className="flex gap-2 mt-1">
                            {p.flipkart && <a href={p.flipkart} target="_blank" rel="noreferrer" className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Flipkart</a>}
                            {p.amazon && <a href={p.amazon} target="_blank" rel="noreferrer" className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Amazon</a>}
                            {p.shopify && <a href={p.shopify} target="_blank" rel="noreferrer" className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Shopify</a>}
                            {p.ajio && <a href={p.ajio} target="_blank" rel="noreferrer" className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded">Ajio</a>}
                            {p.myntra && <a href={p.myntra} target="_blank" rel="noreferrer" className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Myntra</a>}
                            {p.tatacliq && <a href={p.tatacliq} target="_blank" rel="noreferrer" className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">TataCliQ</a>}
                            {p.nykaa && <a href={p.nykaa} target="_blank" rel="noreferrer" className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Nykaa</a>}
                            {p.meesho && <a href={p.meesho} target="_blank" rel="noreferrer" className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">Meesho</a>}
                            {p.snapdeal && <a href={p.snapdeal} target="_blank" rel="noreferrer" className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">Snapdeal</a>}
                            {p.paytmmall && <a href={p.paytmmall} target="_blank" rel="noreferrer" className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Paytm Mall</a>}
                            {p.firstcry && <a href={p.firstcry} target="_blank" rel="noreferrer" className="text-xs bg-lime-100 text-lime-700 px-2 py-0.5 rounded">FirstCry</a>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditProduct(slider.id, pid, p)} className="px-2 py-1 bg-yellow-400 rounded">Edit</button>
                        <button onClick={() => handleDeleteProduct(slider.id, pid)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default OfferSlider;