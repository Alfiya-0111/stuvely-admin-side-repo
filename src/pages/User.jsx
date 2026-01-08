import React, { useState, useEffect } from "react";

function User() {
  const [logoType, setLogoType] = useState("text");
  const [logoValue, setLogoValue] = useState("");
  const [navLinks, setNavLinks] = useState([]);
  const [newLink, setNewLink] = useState({ label: "", href: "" });

  useEffect(() => {
    fetch("https://stuvely-data-default-rtdb.firebaseio.com/logodata.json")
      .then((res) => res.json())
      .then((result) => {
        setLogoType(result.logo?.type || "text");
        setLogoValue(result.logo?.value || "");
        setNavLinks(result.navLinks || []);
      });
  }, []);

  const handleSave = () => {
    const updatedData = {
      logo: { type: logoType, value: logoValue },
      navLinks,
    };

    fetch("https://stuvely-data-default-rtdb.firebaseio.com/logodata.json", {
      method: "PUT",
      body: JSON.stringify(updatedData),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => alert("Updated Successfully"))
      .catch((err) => console.error(err));
  };

  const addNavLink = () => {
    if (newLink.label && newLink.href) {
      setNavLinks([...navLinks, newLink]);
      setNewLink({ label: "", href: "" });
    }
  };

  const deleteNavLink = (index) => {
    const updated = navLinks.filter((_, i) => i !== index);
    setNavLinks(updated);
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>

      {/* Logo Section */}
      <div className="mb-4">
        <label>Logo Type: </label>
        <select
          value={logoType}
          onChange={(e) => setLogoType(e.target.value)}
          className="border p-1 ml-2"
        >
          <option value="text">Text</option>
          <option value="image">Image URL</option>
        </select>
        <input
          type="text"
          value={logoValue}
          onChange={(e) => setLogoValue(e.target.value)}
          placeholder={logoType === "text" ? "Enter Logo Text" : "Enter Image URL"}
          className="border p-1 ml-2"
        />
      </div>

      {/* Nav Links Section */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">Navigation Links</h3>
        {navLinks.map((link, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <input
              type="text"
              value={link.label}
              onChange={(e) => {
                const updated = [...navLinks];
                updated[i].label = e.target.value;
                setNavLinks(updated);
              }}
              className="border p-1"
            />
            <input
              type="text"
              value={link.href}
              onChange={(e) => {
                const updated = [...navLinks];
                updated[i].href = e.target.value;
                setNavLinks(updated);
              }}
              className="border p-1"
            />
            {/* Delete Button */}
            <button
              onClick={() => deleteNavLink(i)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}

        {/* Add new link */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            placeholder="Label"
            className="border p-1"
          />
          <input
            type="text"
            value={newLink.href}
            onChange={(e) => setNewLink({ ...newLink, href: e.target.value })}
            placeholder="Href"
            className="border p-1"
          />
          <button
            onClick={addNavLink}
            className="bg-blue-500 text-white px-2 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="bg-green-500 text-white px-4 py-1 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}

export default User;
