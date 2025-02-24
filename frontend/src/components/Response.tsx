import React from "react";
import ReactMarkdown from "react-markdown";

const Response = ({ response }) => {
  if (!response) return null;

  return (
    <div className="mt-6 p-4 bg-gray-100 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-2">AI Response:</h2>
      <div className="text-gray-700 prose">
        <ReactMarkdown>
          {response.response || response.message || response.error}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Response;
