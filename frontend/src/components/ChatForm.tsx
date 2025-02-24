import { useState } from "react";
import { useForm } from "react-hook-form";
import { processImageQuery } from "../api";

const ChatForm = ({ setResponse }) => {
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null); // 🔹 Store image preview

  // Function to handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // 🔹 Create URL for preview
    } else {
      setPreview(null); // 🔹 Reset preview if no file
    }
  };

  const onSubmit = async (data) => {
    if (!data.file[0] || !data.query) {
      alert("Please provide both an image and a query.");
      return;
    }

    setLoading(true);
    const result = await processImageQuery(data.file[0], data.query);
    setResponse(result);
    setLoading(false);
    reset();
    setPreview(null); // 🔹 Reset preview after submit
  };

  return (
    <form
      className="bg-white p-6 shadow-md rounded-lg"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label className="block text-gray-700 font-bold mb-2">
        Upload Medical Image:
      </label>

      <input
        type="file"
        accept="image/*"
        {...register("file")}
        className="w-full border p-2 mb-4"
        onChange={handleFileChange} // 🔹 Update preview on file selection
      />

      {/* 🔹 Image Preview Section */}
      {preview && (
        <div className="mb-4">
          <p className="text-gray-700 font-semibold mb-2">Image Preview:</p>
          <img
            src={preview}
            alt="Uploaded Preview"
            className="w-full h-auto rounded-md border"
          />
        </div>
      )}

      <label className="block text-gray-700 font-bold mb-2">
        Enter Your Query:
      </label>
      <input
        type="text"
        placeholder="Describe your medical concern..."
        {...register("query")}
        className="w-full border p-2 mb-4"
      />

      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Processing..." : "Submit"}
      </button>
    </form>
  );
};

export default ChatForm;
