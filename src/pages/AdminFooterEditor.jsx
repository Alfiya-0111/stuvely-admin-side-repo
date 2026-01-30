// src/component/AdminFooterEditor.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { ref, onValue, set } from "firebase/database";
import { update } from "firebase/database";

export default function AdminFooterEditor() {
  const [footerData, setFooterData] = useState({
    columns: {},
    social: {},
    mailUs: "",
    address: "",
  });
  const [pagesData, setPagesData] = useState({});
  const [newPage, setNewPage] = useState({ slug: "", title: "", content: "" });
  const [newColumn, setNewColumn] = useState({ name: "" });
  const [newLink, setNewLink] = useState({ column: "", name: "", slug: "" });
  const [editingPage, setEditingPage] = useState(null); // slug of page being edited

  // 🔹 Load data from Firebase
  useEffect(() => {
    const footerRef = ref(db, "footer");
    const pagesRef = ref(db, "pages");

    onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooterData({
          columns: data.columns || {},
          social: data.social || {},
          mailUs: data.mailUs || "",
          address: data.address || "",
        });
      }
    });

    onValue(pagesRef, (snapshot) => {
      if (snapshot.exists()) setPagesData(snapshot.val());
    });
  }, []);

  // 🔹 Update Firebase data
  const updateFooterDB = (updated) => {
    setFooterData(updated);
    set(ref(db, "footer"), updated);
  };

  const updatePagesDB = (updated) => {
    setPagesData(updated);
    set(ref(db, "pages"), updated);
  };

  // 🔹 Handle footer field updates
  const handleFooterChange = (path, value) => {
    const updated = { ...footerData };
    const keys = path.split(".");
    let temp = updated;
    keys.forEach((k, i) =>
      i === keys.length - 1 ? (temp[k] = value) : (temp = temp[k] = temp[k] || {})
    );
    updateFooterDB(updated);
  };

  // 🔹 Add New Column
  const saveNewColumn = () => {
    if (!newColumn.name.trim()) return alert("Column name is required!");
    const updated = { ...footerData };
    if (!updated.columns) updated.columns = {};
    if (updated.columns[newColumn.name])
      return alert("This column already exists!");
    updated.columns[newColumn.name] = { links: {} };
    updateFooterDB(updated);
    setNewColumn({ name: "" });
  };

  // 🔹 Delete Column
  const deleteColumn = (colName) => {
    if (!window.confirm(`Delete column "${colName}"?`)) return;
    const updated = { ...footerData };
    delete updated.columns[colName];
    updateFooterDB(updated);
  };

  // 🔹 Add New Link
  const saveNewLink = () => {
    const { column, name, slug } = newLink;
    if (!column || !name || !slug) return alert("All fields are required!");
    const updated = { ...footerData };
    if (!updated.columns[column]) updated.columns[column] = { links: {} };
    updated.columns[column].links[name] = slug;
    updateFooterDB(updated);
    setNewLink({ column: "", name: "", slug: "" });
  };

  // 🔹 Delete Link
  const deleteLink = (colName, linkName) => {
    if (!window.confirm(`Delete link "${linkName}" from "${colName}"?`)) return;
    const updated = { ...footerData };
    delete updated.columns[colName].links[linkName];
    updateFooterDB(updated);
  };

  // 🔹 Handle Page Change (temporary state while editing)
  const handleTempPageChange = (slug, key, value) => {
    setPagesData((prev) => ({
      ...prev,
      [slug]: { ...prev[slug], [key]: value },
    }));
  };

  // 🔹 Save Page Changes

const savePageChanges = (slug) => {
  const page = pagesData[slug];

  update(ref(db, `pages/${slug}`), {
    title: page.title,
    content: page.content,
  });

  setEditingPage(null);
};

  // 🔹 Add New Page
  const saveNewPage = () => {
    if (!newPage.slug || !newPage.title)
      return alert("Slug and Title are required!");
    const updated = { ...pagesData };
    updated[newPage.slug] = { title: newPage.title, content: newPage.content };
    updatePagesDB(updated);
    setNewPage({ slug: "", title: "", content: "" });
  };

  // 🔹 Delete Page
  const deletePage = (slug) => {
    if (!window.confirm(`Delete page "${slug}"?`)) return;
    const updated = { ...pagesData };
    delete updated[slug];
    updatePagesDB(updated);
  };

  return (
    <div className="container mx-auto">
      <div>
        <div className="bg-white p-6 shadow-xl rounded-xl space-y-6">
          <h2 className="text-2xl font-semibold">🛠 Edit Footer & Pages</h2>

          {/* ➕ Add New Column */}
          <div className="mb-4 border p-3 rounded">
            <h3 className="font-semibold mb-2">➕ Add New Column</h3>
            <input
              className="border p-1 w-full mb-2 rounded"
              placeholder="Column Name"
              value={newColumn.name}
              onChange={(e) => setNewColumn({ name: e.target.value })}
            />
            <button
              onClick={saveNewColumn}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Save Column
            </button>
          </div>

          {/* 📂 Existing Columns */}
          {footerData.columns &&
            Object.entries(footerData.columns).map(([colName, colData]) => (
              <div key={colName} className="mb-4 border p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{colName}</h3>
                  <button
                    onClick={() => deleteColumn(colName)}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                  >
                    Delete Column
                  </button>
                </div>

                {/* ➕ Add Link */}
                <div className="mb-2">
                  <input
                    className="border p-1 w-full mb-1 rounded"
                    placeholder="Link Name"
                    value={newLink.column === colName ? newLink.name : ""}
                    onChange={(e) =>
                      setNewLink({
                        column: colName,
                        name: e.target.value,
                        slug: newLink.slug,
                      })
                    }
                  />
                  <input
                    className="border p-1 w-full mb-1 rounded"
                    placeholder="Link Slug"
                    value={newLink.column === colName ? newLink.slug : ""}
                    onChange={(e) =>
                      setNewLink({
                        column: colName,
                        name: newLink.name,
                        slug: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={saveNewLink}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Save Link
                  </button>
                </div>

                {/* 🔗 Existing Links */}
                {colData.links &&
                  Object.entries(colData.links).map(([linkName, slug]) => (
                    <div key={slug} className="flex items-center gap-2 mb-2">
                      <input
                        className="border p-1 flex-1 rounded"
                        value={linkName}
                        onChange={(e) => {
                          const updatedLinks = { ...colData.links };
                          const newName = e.target.value;
                          delete updatedLinks[linkName];
                          updatedLinks[newName] = slug;
                          handleFooterChange(
                            `columns.${colName}.links`,
                            updatedLinks
                          );
                        }}
                      />
                      <input
                        className="border p-1 flex-1 rounded"
                        value={slug}
                        onChange={(e) => {
                          const updatedLinks = { ...colData.links };
                          updatedLinks[linkName] = e.target.value;
                          handleFooterChange(
                            `columns.${colName}.links`,
                            updatedLinks
                          );
                        }}
                      />
                      <button
                        onClick={() => deleteLink(colName, linkName)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            ))}

          {/* 📧 Mail & Address */}
          <div>
            <h3 className="font-semibold mb-2">Mail Us</h3>
            <input
              className="border p-1 w-full rounded"
              value={footerData.mailUs || ""}
              onChange={(e) => handleFooterChange("mailUs", e.target.value)}
            />
          </div>
          <div>
            <h3 className="font-semibold mb-2">Address</h3>
            <textarea
              className="border p-1 w-full rounded"
              value={footerData.address || ""}
              onChange={(e) => handleFooterChange("address", e.target.value)}
            />
          </div>

          {/* 📄 Pages Editor */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">📄 Pages Content</h2>

            {/* Add New Page */}
            <div className="mb-4 border p-2 rounded">
              <h3 className="font-semibold mb-2">➕ Add New Page</h3>
              <input
                className="border p-1 w-full mb-2 rounded"
                placeholder="Page Slug"
                value={newPage.slug}
                onChange={(e) =>
                  setNewPage((prev) => ({ ...prev, slug: e.target.value }))
                }
              />
              <input
                className="border p-1 w-full mb-2 rounded"
                placeholder="Page Title"
                value={newPage.title}
                onChange={(e) =>
                  setNewPage((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <textarea
                className="border p-1 w-full mb-2 rounded"
                placeholder="Page Content (HTML allowed)"
                value={newPage.content}
                onChange={(e) =>
                  setNewPage((prev) => ({ ...prev, content: e.target.value }))
                }
              />
              <button
                onClick={saveNewPage}
                className="bg-purple-500 text-white px-3 py-1 rounded"
              >
                Save Page
              </button>
            </div>

            {/* Existing Pages */}
            {pagesData &&
              Object.entries(pagesData).map(([slug, page]) => (
                <div key={slug} className="mb-4 border p-2 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{slug}</h3>
                    <div className="flex gap-2">
                      {editingPage === slug ? (
                        <button
                          onClick={() => savePageChanges(slug)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingPage(slug)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deletePage(slug)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <input
                    className="border p-1 w-full rounded mb-1"
                    value={page.title}
                    readOnly={editingPage !== slug}
                    onChange={(e) =>
                      handleTempPageChange(slug, "title", e.target.value)
                    }
                  />
                  <textarea
                    className="border p-1 w-full rounded"
                    value={page.content}
                    readOnly={editingPage !== slug}
                    onChange={(e) =>
                      handleTempPageChange(slug, "content", e.target.value)
                    }
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
