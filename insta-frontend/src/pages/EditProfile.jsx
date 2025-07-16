import { useState, useEffect } from "react";
import axios from "axios";

export default function EditProfile() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [preview, setPreview] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("username");
    if (!stored) {
      window.location.href = "/login";
      return;
    }
    setUsername(stored);

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${stored}`);
        if (res.data.profilePic) {
          setPreview(`http://localhost:5000${res.data.profilePic}`);
        }
        if (res.data.bio) {
          setBio(res.data.bio);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("bio", bio);
    if (profilePicFile) {
      formData.append("profilePic", profilePicFile);
    }

    try {
      await axios.put("http://localhost:5000/api/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      window.location.href = "/profile";
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    window.location.href = "/profile";
  };

  if (loading) return <p className="text-center py-20 text-gray-500">Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-3xl font-bold mb-6 text-center">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col items-center">
            <img
              src={preview || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-28 h-28 rounded-full border object-cover mb-4"
            />
            <label className="text-sm font-medium text-gray-700 mb-2">
              Change Profile Picture
            </label>
            <input
              type="file"
              onChange={handleFile}
              className="text-sm text-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Username</label>
            <input
              value={username}
              disabled
              className="border px-4 py-2 rounded w-full bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell something about yourself..."
              className="border px-4 py-2 rounded w-full resize-none"
            />
          </div>

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
