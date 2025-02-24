import { useState } from "react";
import ChatForm from "../components/ChatForm";
import Response from "../components/Response";

const Home = () => {
  const [response, setResponse] = useState(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="flex w-full max-w-6xl gap-6">
        {/* Left: ChatForm */}
        <div className="w-2/3 bg-white p-6 shadow-md rounded-lg items-center justify-center">
          <ChatForm setResponse={setResponse} />
          <div className="w-full bg-transparent p-6">
            <Response response={response} />
          </div>
        </div>

        {/* Right: Response */}
      </div>
    </div>
  );
};

export default Home;
