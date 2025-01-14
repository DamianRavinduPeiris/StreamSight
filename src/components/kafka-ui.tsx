import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Alert from "./alert/Alert";

const socket = io("http://localhost:5000");

export default function KafkaUI() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [shouldShowConsumableEvents, setConsumableEventsStatus] = useState<boolean>(false);
  const [showAlert, setAlertStatus] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [consumedEvents, setConsumedEvents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    socket.on("status", (status) => {
      setAlertStatus(true);
      setAlertMessage(status);
      setTimeout(() => setAlertStatus(false), 2000);
    });

    socket.on("realTimeMessage", (message) => {
      setConsumedEvents((prev) => [message, ...prev]);
    });

    return () => {
      socket.off("status");
      socket.off("realTimeMessage");
    };
  }, []);

  const handleProduce = () => {
    socket.emit("produce", { topic, message });
    setConsumedEvents((prev) => [`[${topic}] ${message}`, ...prev]);
  };

  const formatJSON = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return input;
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredEvents = consumedEvents.filter((event) =>
    JSON.stringify(event).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highlightQuery = (text: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-8">
      <h1 className="text-4xl font-bold tracking-wide mb-10">StreamSight</h1>

      {showAlert && (
        <Alert msg={alertMessage} />
      )}

      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Produce Event</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <textarea
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={(e) => setMessage(formatJSON(e.target.value))}
              className="w-full h-32 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <div className="flex justify-between">
              <button
                onClick={handleProduce}
                disabled={!topic || !message}
                className={`px-6 py-2 rounded-lg text-white font-medium transition ${
                  topic && message
                    ? "bg-blue-600 hover:bg-blue-500"
                    : "bg-gray-600 cursor-not-allowed"
                }`}
              >
                Produce Event
              </button>
              <button
                onClick={() =>
                  setConsumableEventsStatus(!shouldShowConsumableEvents)
                }
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
              >
                {shouldShowConsumableEvents ? "Hide Events" : "Consume Events"}
              </button>
            </div>
          </div>
        </div>

        {shouldShowConsumableEvents && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Consumed Events</h2>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
            />
            <div className="overflow-y-auto max-h-64 bg-gray-700 rounded-lg">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <div
                    key={index}
                    className={`p-4 border-b border-gray-600 ${
                      index === 0 ? "bg-gray-600" : "bg-gray-700"
                    }`}
                  >
                    <pre className="text-sm">
                      {highlightQuery(formatJSON(event))}
                    </pre>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">
                  No events found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
