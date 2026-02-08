import React, { useEffect, useState } from "react";
import { useRef } from "react";
const BASE_URL = "https://stuvely-data-default-rtdb.firebaseio.com";
const IMGBB_API_KEY = "0a20bc1e3b35864b35f589679aa50b0d";

const uploadToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.data.url; // final image URL
};


export default function AdminCollections() {
    const collectionFormRef = useRef(null);
  const productFormRef = useRef(null);
  const [offers, setOffers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
const [collectionImageFile, setCollectionImageFile] = useState(null);

const [collectionForm, setCollectionForm] = useState({
  name: "",
  imageUrl: "",

  // OFFER SLIDER
  showInOffer: false,
  offerTitle: "",
  offerSubtitle: "",
  offerBgColor: "",
  offerPercent: "",
  offerImage: "",
});
const [offerImageFile, setOfferImageFile] = useState(null);
  /* ---------------- PRODUCT STATE (SAME AS CARPRODUCT) ---------------- */
  const emptyProduct = {
    collectionId: "",
      offerId: "", 
    name: "",
    shortDescription: "",
    price: "",
      stock: "", 
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
     showInOffer: false,
     
      offerPercent: "",
     
  };

  const [productData, setProductData] = useState(emptyProduct);
  const [editingProductId, setEditingProductId] = useState(null);

  /* ---------------- FETCH COLLECTIONS ---------------- */
  const fetchOffers = async () => {
  const res = await fetch(`${BASE_URL}/offersliders.json`);
  const data = await res.json();

  if (data) {
    const arr = Object.keys(data).map(id => ({
      id,
      name: data[id].title, // 👈 dropdown ke liye
      isOfferOnly: true,
      ...data[id],
    }));
    setOffers(arr);
  }
};
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
  if (collectionForm.showInOffer) {
    setCollectionForm((prev) => ({
      ...prev,
      name: "",
      imageUrl: "",
    }));
    setCollectionImageFile(null);
  }
}, [collectionForm.showInOffer]);

useEffect(() => {
  fetchCollections();
  fetchOffers();
}, []);


  const slugify = (text) =>
    text.trim().toLowerCase().replace(/\s+/g, "-");
//collection edit function 
const editCollection = (col) => {
  setEditingCollectionId(col.id);
  setCollectionForm({
    name: col.name,
    imageUrl: col.imageUrl,
  });
  setCollectionImageFile(null);

  // scroll nahi, bas form visible area mein
  collectionFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
};


  /* ---------------- COLLECTION CRUD ---------------- */
const handleCollectionSubmit = async (e) => {
  e.preventDefault();

  /* ================= OFFER SLIDER ONLY ================= */
  if (collectionForm.showInOffer) {
    let offerImageUrl = collectionForm.offerImage;

    if (offerImageFile) {
      offerImageUrl = await uploadToImgBB(offerImageFile);
    }

    await fetch(`${BASE_URL}/offersliders.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
       type: "collection",
  title: collectionForm.offerTitle,
  subtitle: collectionForm.offerSubtitle,
  bgColor: collectionForm.offerBgColor,
  offerPercent: collectionForm.offerPercent,
  bgImage: offerImageUrl,
  slug: slugify(collectionForm.offerTitle),
  products: {} // products tab add karenge jab product add ho
      }),
    });

    alert("Offer slider added successfully ✅");

    // reset
    setCollectionForm({
      name: "",
      imageUrl: "",
      showInOffer: false,
      offerTitle: "",
      offerSubtitle: "",
      offerBgColor: "",
      offerPercent: "",
      offerImage: "",
    });
    setOfferImageFile(null);

    fetchCollections();
    return; // ✅ AB return sahi jagah par hai
  }
// Firebase path
const sliderId = productData.collectionId || `offer-${Date.now()}`;
const res = await fetch(`${BASE_URL}/offersliders/${sliderId}/products.json`);
const existingProducts = await res.json() || {};

// Naya product add karo
existingProducts[productId] = {
  id: productId,
  name: productData.name,
  imageUrl: productData.image || productData.gallery?.[0] || "",
  price: productData.price,
  offerPercent: productData.offerPercent || 0,
  shortDescription: productData.shortDescription || ""
};

// Slider update karo
await fetch(`${BASE_URL}/offersliders/${sliderId}.json`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "product",
    title: productData.name,
    slug: slugify(productData.name),
    products: existingProducts
  }),
});

  /* ================= NORMAL COLLECTION ================= */
  let imageUrl = collectionForm.imageUrl;

  if (collectionImageFile) {
    imageUrl = await uploadToImgBB(collectionImageFile);
  }

  const payload = {
    name: collectionForm.name,
    imageUrl,
    slug: slugify(collectionForm.name),
    isOfferOnly: false,
    products:
      editingCollectionId
        ? collections.find((c) => c.id === editingCollectionId)?.products || {}
        : {},
  };

  const url = editingCollectionId
    ? `${BASE_URL}/ourcollections/${editingCollectionId}.json`
    : `${BASE_URL}/ourcollections.json`;

  await fetch(url, {
    method: editingCollectionId ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  alert(editingCollectionId ? "Collection Updated" : "Collection Added");

  setCollectionForm({ name: "", imageUrl: "", showInOffer: false });
  setCollectionImageFile(null);
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

  const productPayload = {
    ...productData,
    createdAt: Date.now(),
  };

  const url = editingProductId
    ? `${BASE_URL}/ourcollections/${productData.collectionId}/products/${editingProductId}.json`
    : `${BASE_URL}/ourcollections/${productData.collectionId}/products.json`;

  const res = await fetch(url, {
    method: editingProductId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productPayload),
  });

  const result = await res.json();
  const productId = editingProductId || result.name;
// const editCollection = (col) => {
//   setEditingCollectionId(col.id);
//   setCollectionForm({
//     name: col.name,
//     imageUrl: col.imageUrl,

//     showInOffer: col.showInOffer || false,
//     offerTitle: col.offerTitle || "",
//     offerSubtitle: col.offerSubtitle || "",
//     offerBgColor: col.offerBgColor || "",
//     offerPercent: col.offerPercent || "",
//     offerImage: col.offerImage || "",
//   });

//   setCollectionImageFile(null);
//   setOfferImageFile(null);
// };

  /* 🔥 OFFER SLIDER ENTRY (NO DATA LOSS) */
  if (productData.showInOffer) {
    await fetch(
      `${BASE_URL}/offersliders/${productData.collectionId}.json`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: productData.name,
          subtitle: productData.shortDescription || "",
          slug: productData.name.toLowerCase().replace(/\s+/g, "-"),
          productImage:
            productData.image ||
            productData.gallery?.[0] ||
            "",
          products: {
            [productId]: {
              imageUrl:
                productData.image ||
                productData.gallery?.[0] ||
                "",
            },
          },
        }),
      }
    );
  }
// -------- OFFER SLIDER FOR COLLECTION --------
if (collectionForm.showInOffer) {
  let offerImageUrl = collectionForm.offerImage;

  if (offerImageFile) {
    offerImageUrl = await uploadToImgBB(offerImageFile);
  }

await fetch(`${BASE_URL}/offersliders/${productData.collectionId}.json`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: productData.name,
    subtitle: productData.shortDescription || "",
    offerPercent: productData.offerPercent || "",
    productImage:
      productData.imageUrl ||
      productData.images?.[0] ||
      "",
    slug: slugify(productData.name),
    type: "product", 
  }),
});


}

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

  // scroll nahi, bas product form visible area mein
  productFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
// const payload = collectionForm.showInOffer
//   ? {
//       // ONLY for offer slider collections
//       showInOffer: true,
//       offerTitle: collectionForm.offerTitle,
//       offerSubtitle: collectionForm.offerSubtitle,
//       offerBgColor: collectionForm.offerBgColor,
//       offerPercent: collectionForm.offerPercent,
//       offerImage: collectionForm.offerImage,
//       slug: slugify(collectionForm.offerTitle),
//     }
//   : {
//       // NORMAL COLLECTION
//       name: collectionForm.name,
//       imageUrl,
//       slug: slugify(collectionForm.name),
//       products:
//         editingCollectionId
//           ? collections.find((c) => c.id === editingCollectionId)?.products || {}
//           : {},
//     };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen overflow-y-auto">

      {/* COLLECTION FORM */}
      <div ref={collectionFormRef} className="bg-white p-5 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-3">
          {editingCollectionId ? "Edit Collection" : "Add Collection"}
        </h2>
<label className="flex items-center gap-2 mt-2">
  <input
    type="checkbox"
    checked={collectionForm.showInOffer}
    onChange={(e) =>
      setCollectionForm({
        ...collectionForm,
        showInOffer: e.target.checked,
      })
    }
  />
  <span className="text-sm font-medium">
    Show this collection in Offer Slider
  </span>
</label>
{collectionForm.showInOffer && (
  <div className="grid gap-2 border p-3 rounded bg-gray-50">
    <input
      className="border p-2 rounded"
      placeholder="Offer Title"
      value={collectionForm.offerTitle}
      onChange={(e) =>
        setCollectionForm({ ...collectionForm, offerTitle: e.target.value })
      }
    />

    <input
      className="border p-2 rounded"
      placeholder="Offer Subtitle"
      value={collectionForm.offerSubtitle}
      onChange={(e) =>
        setCollectionForm({
          ...collectionForm,
          offerSubtitle: e.target.value,
        })
      }
    />

    <input
      className="border p-2 rounded"
      placeholder="Background Color (eg: #000 or gradient)"
      value={collectionForm.offerBgColor}
      onChange={(e) =>
        setCollectionForm({
          ...collectionForm,
          offerBgColor: e.target.value,
        })
      }
    />

    <input
      type="number"
      className="border p-2 rounded"
      placeholder="Offer %"
      value={collectionForm.offerPercent}
      onChange={(e) =>
        setCollectionForm({
          ...collectionForm,
          offerPercent: e.target.value,
        })
      }
    />

   <input
  type="file"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];
    setOfferImageFile(file);
    setCollectionForm({
      ...collectionForm,
      offerImage: URL.createObjectURL(file), // preview
    });
  }}
/>


    {collectionForm.offerImage && (
      <img
        src={collectionForm.offerImage}
        className="w-24 h-16 object-cover rounded"
      />
    )}
  </div>
)}

        <form onSubmit={handleCollectionSubmit} className="grid gap-3">
    {!collectionForm.showInOffer && (
  <>
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
      type="file"
      accept="image/*"
      className="border p-2 rounded"
      onChange={(e) => setCollectionImageFile(e.target.files[0])}
    />

    {collectionForm.imageUrl && (
      <img
        src={collectionForm.imageUrl}
        className="w-20 h-20 object-cover rounded border"
      />
    )}
  </>
)}


          <button className="bg-blue-600 text-white px-4 py-2 rounded w-max">
            {editingCollectionId ? "Update" : "Add"}
          </button>
        </form>
      </div>

      {/* PRODUCT FORM */}
      <div ref={productFormRef} className="bg-white p-5 rounded shadow mb-6">
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
  <option value="">Select Collection / Offer</option>

  {/* NORMAL COLLECTIONS */}
  {collections
    .filter(c => c.name && c.name.trim() !== "")
    .map(c => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}

  {/* OFFER SLIDERS */}
  {offers.map(s => (
    <option key={s.id} value={`offer-${s.id}`}>
      🔥 {s.name} (Offer)
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
  type="number"
  className="border p-2 rounded"
  placeholder="Stock Quantity"
  value={productData.stock}
  onChange={(e) =>
    setProductData({ ...productData, stock: e.target.value })
  }
  required
/>

<label className="flex items-center gap-2">
  <input
    type="checkbox"
    checked={productData.showInOffer}
    onChange={(e) =>
      setProductData({
        ...productData,
        showInOffer: e.target.checked,
      })
    }
  />
  <span className="text-sm font-medium">
    Show this product in Offer Slider
  </span>
</label>

{/* 🔥 EXTRA INPUT */}
{productData.showInOffer && (
  <input
    type="number"
    className="border p-2 rounded"
    placeholder="Offer % (eg: 20)"
    value={productData.offerPercent}
    onChange={(e) =>
      setProductData({
        ...productData,
        offerPercent: e.target.value,
      })
    }
  />
)}



        <input
  type="file"
  accept="image/*"
  className="border p-2 rounded"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadToImgBB(file);
    setProductData({ ...productData, image: url });
  }}
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
  type="file"
  accept="image/*"
  className="flex-1 border p-2 rounded"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadToImgBB(file);
    updateGallery(i, url);
  }}
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

 <div className="flex gap-3">
  <button
    className="text-blue-600 text-sm"
    onClick={() => editCollection(col)}
  >
    Edit
  </button>

  <button
    className="text-red-600 text-sm"
    onClick={() => deleteCollection(col.id)}
  >
    Delete
  </button>
</div>

</div>

   {col.products &&
  Object.entries(col.products).map(([pid, p]) => {
    const img = p.image || p.imageUrl;

    // ✅ Calculate discounted price
   const discountedPrice =
  p.price && p.offerPercent
    ? Math.round(Number(p.price) - (Number(p.price) * Number(p.offerPercent)) / 100)
    : null;


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

            {/* Original Price */}
            <p className="text-sm text-gray-600">
              {discountedPrice ? (
                <span className="line-through text-gray-400 mr-2">₹{p.price}</span>
              ) : (
                <>₹{p.price}</>
              )}
            </p>

            {/* Discounted Price */}
            {discountedPrice && (
              <p className="text-sm text-green-600 font-semibold">
                ₹{discountedPrice} ({p.offerPercent}% OFF)
              </p>
            )}

            {p.shortDescription && (
              <p className="text-xs text-gray-500">{p.shortDescription}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          {/* SHOW IN OFFER CHECKBOX */}
      <div className="flex flex-col gap-1 items-end">
  {/* SHOW IN OFFER CHECKBOX */}
  <label className="flex items-center gap-1 text-xs">
    <input
      type="checkbox"
      checked={p.showInOffer || false}
      onChange={async (e) => {
        const checked = e.target.checked;

        // 1️⃣ Update local productData for UI
        setProductData({
          ...productData,
          showInOffer: checked,
          offerId: checked ? p.offerId || offers[0]?.id : null,
          offerPercent: checked ? p.offerPercent || offers[0]?.offerPercent || 0 : 0,
        });

        const offerIdToUse = checked ? p.offerId || offers[0]?.id : p.offerId;

        if (checked) {
          // ✅ Add product to offer slider
          if (offerIdToUse) {
            await fetch(`${BASE_URL}/offersliders/${offerIdToUse}/products/${pid}.json`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: p.name,
                image: p.image || p.imageUrl,
                price: p.price,
                offerPercent: p.offerPercent || 0,
                collectionId: col.id,
              }),
            });
          }

          // ✅ Update product in collection
          await fetch(`${BASE_URL}/ourcollections/${col.id}/products/${pid}.json`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ showInOffer: true, offerId: offerIdToUse }),
          });
        } else {
          // ✅ Remove product from offer slider
          if (offerIdToUse) {
            await fetch(`${BASE_URL}/offersliders/${offerIdToUse}/products/${pid}.json`, {
              method: "DELETE",
            });

            await fetch(`${BASE_URL}/ourcollections/${col.id}/products/${pid}.json`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ showInOffer: false, offerId: null, offerPercent: 0 }),
            });
          }
        }

        // 2️⃣ Refetch collections & offers for UI
        fetchCollections();
        fetchOffers();
      }}
    />
    Offer
  </label> 
{/* OFFER DROPDOWN */}
{p.showInOffer && (
  <select
    value={p.offerId || ""}
    onChange={async (e) => {
      const newOfferId = e.target.value;
      const selectedOffer = offers.find((o) => o.id === newOfferId);

      // ✅ Update Firebase first
      if (p.offerId && p.offerId !== newOfferId) {
        await fetch(`${BASE_URL}/offersliders/${p.offerId}/products/${pid}.json`, { method: "DELETE" });
      }

      if (newOfferId) {
        await fetch(`${BASE_URL}/offersliders/${newOfferId}/products/${pid}.json`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: p.name,
            image: p.image || p.imageUrl,
            price: p.price,
            offerPercent: selectedOffer?.offerPercent || 0,
            collectionId: col.id,
          }),
        });

        await fetch(`${BASE_URL}/ourcollections/${col.id}/products/${pid}.json`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            offerId: newOfferId,
            offerPercent: selectedOffer?.offerPercent || 0,
          }),
        });
      }

      // ✅ Update collections state directly for instant UI
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id === col.id) {
            return {
              ...c,
              products: {
                ...c.products,
                [pid]: {
                  ...c.products[pid],
                  offerId: newOfferId,
                  offerPercent: selectedOffer?.offerPercent || 0,
                },
              },
            };
          }
          return c;
        })
      );
    }}
  >
    <option value="">Select Offer</option>
    {offers.map((o) => (
      <option key={o.id} value={o.id}>
        🔥 {o.name} ({o.offerPercent || 0}% OFF)
      </option>
    ))}
  </select>
)}
  {/* DISCOUNTED PRICE */}
  {p.price && p.offerPercent ? (
    <p className="text-sm text-green-600 font-semibold">
      ₹{Math.round(Number(p.price) - (Number(p.price) * Number(p.offerPercent)) / 100)} (
      {p.offerPercent}% OFF)
    </p>
  ) : (
    <p className="text-sm text-gray-600">₹{p.price}</p>
  )}
</div>

<p className="text-sm text-gray-600">
  Stock: {p.stock || "N/A"}
</p>
          {/* EXISTING BUTTONS */}
          <div className="flex gap-2 mt-1">
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
      </div>
    );
  })}



        </div>
      ))}
    </div>
  );
}
