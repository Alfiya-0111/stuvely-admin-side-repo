import React, { useState, useEffect } from "react";
function ImgUrl() {
 const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [urls, setUrls] = useState([]); // store {type, url}

  // Load from localStorage on mount
  useEffect(() => {
    const savedUrls = localStorage.getItem("uploadedMedia");
    if (savedUrls) {
      setUrls(JSON.parse(savedUrls));
    }
  }, []);

  // Save to localStorage whenever urls changes
  useEffect(() => {
    if (urls.length > 0) {
      localStorage.setItem("uploadedMedia", JSON.stringify(urls));
    }
  }, [urls]);

  // File select handler
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // Upload handler
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    const fileType = file.type.startsWith("video") ? "video" : "image"; // detect type
    const uploadUrl = `https://api.cloudinary.com/v1_1/dgvjgl2ls/${fileType}/upload`;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "portfolio_upload");
    data.append("cloud_name", "dgvjgl2ls");

    try {
      let res = await fetch(uploadUrl, {
        method: "POST",
        body: data,
      });

      let result = await res.json();

      setUrls((prev) => [...prev, { type: fileType, url: result.secure_url }]);

      setFile(null);
      setPreview(null);
      alert(`${fileType} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    }
  };

  // Delete media from UI & localStorage
  const handleDelete = (index) => {
    const updatedUrls = urls.filter((_, i) => i !== index);
    setUrls(updatedUrls);
    localStorage.setItem("uploadedMedia", JSON.stringify(updatedUrls));
  };


  return (
      <div className="p-4 max-w-4xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Upload Image/Video to Cloudinary
        </h2>

        {/* File input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="w-full sm:w-auto"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Upload
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="mb-4 flex justify-center">
            {file.type.startsWith("video") ? (
              <video
                src={preview}
                controls
                className="w-60 h-40 sm:w-80 sm:h-48 object-cover border rounded"
              />
            ) : (
              <img
                src={preview}
                alt="preview"
                className="w-40 h-40 sm:w-60 sm:h-60 object-cover border rounded"
              />
            )}
          </div>
        )}

        {/* Uploaded Media Table */}
        {urls.length > 0 && (
          <div className="overflow-x-auto">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">
              Uploaded Files
            </h3>
            <table className="table-auto border border-gray-300 w-full text-left">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">#</th>
                  <th className="border px-4 py-2">Preview</th>
                  <th className="border px-4 py-2">URL</th>
                  <th className="border px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                          controls
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt="uploaded"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded"
                        />
                      )}
                    </td>
                    <td className="border px-4 py-2 break-all">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline"
                      >
                        {item.url}
                      </a>
                    </td>
                    <td className="border px-4 py-2 flex flex-wrap gap-2">
                      <button
                        onClick={() => window.open(item.url, "_blank")}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
  )
}

export default ImgUrl