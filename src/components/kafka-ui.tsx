import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Alert from "./alert/Alert";

const socket = io("http://localhost:5000");

export default function KafkaUI() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [consumingTopic, setConsumingTopic] = useState("");
  const [shouldShowConsumableEvents, setConsumableEventsStatus] =
    useState(false);
  const [showAlert, setAlertStatus] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [consumedEvents, setConsumedEvents] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProducerDropdownOpen, setProducerDropdownOpen] = useState(false);
  const [isConsumerDropdownOpen, setConsumerDropdownOpen] = useState(false);

  useEffect(() => {
    socket.on("status", (status) => {
      setAlertStatus(true);
      setAlertMessage(status);
      setTimeout(() => setAlertStatus(false), 2000);
    });

    socket.on("message", (message) => {
      try {
        const formattedMessage = JSON.stringify(JSON.parse(message), null, 2);
        setConsumedEvents((prev) => [formattedMessage, ...prev]);
      } catch (error) {
        console.error("Invalid JSON received:", message);
        setConsumedEvents((prev) => [message, ...prev]);
      }
    });

    socket.on("topics", (topics) => {
      setTopics(topics);
    });

    return () => {
      socket.off("status");
      socket.off("topics");
      socket.off("message");
    };
  }, []);

  const handleProduce = () => {
    socket.emit("produce", { topic, message });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleConsumerTopicSelect = (selectedTopic: string) => {
    console.log("consuming topic", selectedTopic);
    socket.emit("consume", { topic: selectedTopic });
    setConsumingTopic(selectedTopic);
    setConsumerDropdownOpen(false);
  };

  const handleProducerTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setProducerDropdownOpen(false);
  };

  const highlightQuery = (text: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-300">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const filteredTopics = topics.filter((t) =>
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = consumedEvents.filter((event) =>
    event.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatJson = (input: string) => {
    try {
      const formattedJson = JSON.stringify(JSON.parse(input), null, 2);
      setMessage(formattedJson);
      return true;
    } catch (error) {
      setAlertStatus(true);
      setAlertMessage("Invalid JSON format!");
      setTimeout(() => setAlertStatus(false), 2000);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-8">
      <h1 className="text-4xl font-bold tracking-wide mb-10">ALMSafeStream</h1>

      {showAlert && <Alert msg={alertMessage} />}

      <div className="w-full max-w-4xl space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Produce Event</h2>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search and type topic"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  setProducerDropdownOpen(true);
                  setConsumerDropdownOpen(false);
                }}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              {isProducerDropdownOpen && (
                <div className="absolute w-full bg-gray-700 text-white rounded-lg mt-1 z-10 max-h-60 overflow-y-auto">
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topicItem, index) => (
                      <div
                        key={index}
                        onClick={() => handleProducerTopicSelect(topicItem)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-600"
                      >
                        {highlightQuery(topicItem)}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400">
                      No topics found
                    </div>
                  )}
                </div>
              )}
            </div>

            <textarea
              placeholder="Enter message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onBlur={() => formatJson(message)}
              className="w-full h-32 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
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
          </div>
        </div>

        {shouldShowConsumableEvents && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            {consumingTopic ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">
                  Consuming from : {consumingTopic}
                </h2>
                <span className="loading loading-infinity loading-lg"></span>
              </>
            ) : (
              <h2 className="text-2xl font-semibold mb-4">
                Select a topic to consume.
              </h2>
            )}

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search consuming topics"
                value={consumingTopic}
                onFocus={() => {
                  setConsumerDropdownOpen(true);
                  setProducerDropdownOpen(false);
                }}
                onChange={(e) => {
                  setConsumingTopic(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              {isConsumerDropdownOpen && (
                <div className="absolute w-full bg-gray-700 text-white rounded-lg mt-1 z-10 max-h-60 overflow-y-auto">
                  {filteredTopics.length > 0 ? (
                    filteredTopics.map((topicItem, index) => (
                      <div
                        key={index}
                        onClick={() => handleConsumerTopicSelect(topicItem)}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-600"
                      >
                        {highlightQuery(topicItem)}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-400">
                      No topics found
                    </div>
                  )}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Search consumed events..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 mb-4"
            />

            <div className="overflow-y-auto max-h-64 bg-gray-700 rounded-lg">
              {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <div key={index} className="p-4 border-b border-gray-600">
                <pre className="whitespace-pre-wrap text-sm">
                  {highlightQuery(event)}
                </pre>
                </div>
              ))
              ) : (
              <p className="text-gray-400 text-center py-4">
                No events found
              </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setConsumableEventsStatus(!shouldShowConsumableEvents)}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium"
        >
          {shouldShowConsumableEvents ? "Hide Events" : "Consume Events"}
        </button>
      </div>
    </div>
  );
}
