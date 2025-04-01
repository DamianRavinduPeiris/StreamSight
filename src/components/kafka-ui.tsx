import type React from "react"

import { useState, useEffect, useRef } from "react"
import { io } from "socket.io-client"

const socket = io("http://localhost:7000")

export default function KafkaUI() {
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [consumingTopic, setConsumingTopic] = useState("")
  const [shouldShowConsumableEvents, setConsumableEventsStatus] = useState(false)
  const [showAlert, setAlertStatus] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [consumedEvents, setConsumedEvents] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isProducerDropdownOpen, setProducerDropdownOpen] = useState(false)
  const [isConsumerDropdownOpen, setConsumerDropdownOpen] = useState(false)
  const [producerSearchQuery, setProducerSearchQuery] = useState("")
  const [consumerSearchQuery, setConsumerSearchQuery] = useState("")

  const producerDropdownRef = useRef<HTMLDivElement>(null)
  const consumerDropdownRef = useRef<HTMLDivElement>(null)


  const filteredProducerTopics = topics.filter((t) => t.toLowerCase().includes(producerSearchQuery.toLowerCase()))

  const filteredConsumerTopics = topics.filter((t) => t.toLowerCase().includes(consumerSearchQuery.toLowerCase()))

  const filteredEvents = consumedEvents.filter((event) => event.toLowerCase().includes(searchQuery.toLowerCase()))

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (producerDropdownRef.current && !producerDropdownRef.current.contains(event.target as Node)) {
        setProducerDropdownOpen(false)
      }

      if (consumerDropdownRef.current && !consumerDropdownRef.current.contains(event.target as Node)) {
        setConsumerDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])


  useEffect(() => {
    socket.on("status", (status) => {
      setAlertStatus(true)
      setAlertMessage(status)
      setTimeout(() => setAlertStatus(false), 2000)
    })

    socket.on("message", (message) => {
      try {
        const formattedMessage = JSON.stringify(JSON.parse(message), null, 2)
        setConsumedEvents((prev) => [formattedMessage, ...prev])
      } catch (error) {
        console.error("Invalid JSON received:", message)
        setConsumedEvents((prev) => [message, ...prev])
      }
    })

    socket.on("topics", (topics) => {
      setTopics(topics)
    })

    return () => {
      socket.off("status")
      socket.off("topics")
      socket.off("message")
    }
  }, [])

  const handleProduce = () => {
    console.log("producing topic", topic, message)
    socket.emit("produce", { topic, message })
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleConsumerTopicSelect = (selectedTopic: string) => {
    console.log("consuming topic", selectedTopic)
    socket.emit("consume", { topic: selectedTopic })
    setConsumingTopic(selectedTopic)
    setConsumerDropdownOpen(false)
  }

  const handleProducerTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic)
    setProducerDropdownOpen(false)
  }

  const highlightQuery = (text: string) => {
    if (!searchQuery) return text

    const regex = new RegExp(`(${searchQuery})`, "gi")
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ backgroundColor: "#fde047", color: "#000000" }}>
          {part}
        </span>
      ) : (
        part
      ),
    )
  }

  const formatJson = (input: string) => {
    try {
      const formattedJson = JSON.stringify(JSON.parse(input), null, 2)
      setMessage(formattedJson)
      return true
    } catch (error) {
      setAlertStatus(true)
      setAlertMessage("Invalid JSON format!")
      setTimeout(() => setAlertStatus(false), 2000)
      return false
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        color: "#ffffff",
        fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #27272a",
          backgroundColor: "#09090b",
          padding: "16px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontSize: "20px",
              fontWeight: "700",
              letterSpacing: "-0.025em",
            }}
          >
            StreamSight
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                borderRadius: "9999px",
                backgroundColor: "#18181b",
                padding: "4px 12px",
                fontSize: "12px",
                color: "#a1a1aa",
              }}
            >
              {topics.length} Topics
            </div>
            <div
              style={{
                borderRadius: "9999px",
                backgroundColor: "#18181b",
                padding: "4px 12px",
                fontSize: "12px",
                color: "#a1a1aa",
              }}
            >
              {consumedEvents.length} Events
            </div>
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "32px 16px",
        }}
      >
        {/* Alert */}
        {showAlert && (
          <div
            style={{
              position: "fixed",
              top: "16px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: "50",
              maxWidth: "448px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderRadius: "8px",
                backgroundColor: "#27272a",
                padding: "16px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <svg
                style={{ height: "20px", width: "20px" }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              <p style={{ fontSize: "14px" }}>{alertMessage}</p>
              <button
                style={{
                  marginLeft: "auto",
                  borderRadius: "9999px",
                  padding: "4px",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "white",
                }}
                onClick={() => setAlertStatus(false)}
              >
                <svg
                  style={{ height: "16px", width: "16px" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gap: "32px" }}>
          <div
            style={{
              borderRadius: "8px",
              border: "1px solid #27272a",
              backgroundColor: "#18181b",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                borderBottom: "1px solid #27272a",
                padding: "16px 24px",
              }}
            >
              <h2 style={{ fontSize: "18px", fontWeight: "500" }}>Produce Event</h2>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ position: "relative" }} ref={producerDropdownRef}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: "6px",
                      border: "1px solid #3f3f46",
                      backgroundColor: "#27272a",
                      overflow: "hidden",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Search and select topic"
                      value={topic}
                      onChange={(e) => {
                        setTopic(e.target.value)
                        setProducerSearchQuery(e.target.value)
                      }}
                      onFocus={() => {
                        setProducerDropdownOpen(true)
                        setConsumerDropdownOpen(false)
                      }}
                      style={{
                        width: "100%",
                        backgroundColor: "transparent",
                        padding: "8px 16px",
                        color: "white",
                        outline: "none",
                        border: "none",
                      }}
                    />
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "40px",
                        width: "40px",
                        color: "#a1a1aa",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setProducerDropdownOpen(!isProducerDropdownOpen)}
                    >
                      <svg
                        style={{ height: "16px", width: "16px" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {isProducerDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: "10",
                        marginTop: "4px",
                        width: "100%",
                        borderRadius: "6px",
                        border: "1px solid #3f3f46",
                        backgroundColor: "#27272a",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                        {filteredProducerTopics.length > 0 ? (
                          filteredProducerTopics.map((topicItem, index) => (
                            <div
                              key={index}
                              onClick={() => handleProducerTopicSelect(topicItem)}
                              style={{
                                padding: "8px 16px",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = "#3f3f46"
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent"
                              }}
                            >
                              {topicItem}
                            </div>
                          ))
                        ) : (
                          <div
                            style={{
                              padding: "8px 16px",
                              fontSize: "14px",
                              color: "#71717a",
                            }}
                          >
                            No topics found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <textarea
                  placeholder="Enter JSON message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onBlur={() => formatJson(message)}
                  style={{
                    minHeight: "128px",
                    width: "100%",
                    resize: "vertical",
                    borderRadius: "6px",
                    border: "1px solid #3f3f46",
                    backgroundColor: "#27272a",
                    padding: "16px",
                    color: "white",
                    outline: "none",
                    fontFamily: "monospace",
                  }}
                />

                <button
                  onClick={handleProduce}
                  disabled={!topic || !message}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    borderRadius: "6px",
                    padding: "10px 16px",
                    fontWeight: "500",
                    transition: "background-color 0.2s",
                    cursor: topic && message ? "pointer" : "not-allowed",
                    backgroundColor: topic && message ? "#ffffff" : "#27272a",
                    color: topic && message ? "#000000" : "#71717a",
                    border: "none",
                  }}
                >
                  <svg
                    style={{ marginRight: "8px", height: "16px", width: "16px" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Produce Event
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={() => setConsumableEventsStatus(!shouldShowConsumableEvents)}
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
                border: "1px solid #3f3f46",
                backgroundColor: "#27272a",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#3f3f46"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "#27272a"
              }}
            >
              {shouldShowConsumableEvents ? (
                <>
                  <svg
                    style={{ marginRight: "8px", height: "16px", width: "16px" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 7 10 7a13.83 13.83 0 0 1-2.1 3.26M9.9 4.24A10 10 0 0 0 2 12s3 7 10 7a9.6 9.6 0 0 0 5.1-1.74M9.9 4.24L19 13.34M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Hide Events
                </>
              ) : (
                <>
                  <svg
                    style={{ marginRight: "8px", height: "16px", width: "16px" }}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Consume Events
                </>
              )}
            </button>
          </div>

          {shouldShowConsumableEvents && (
            <div
              style={{
                borderRadius: "8px",
                border: "1px solid #27272a",
                backgroundColor: "#18181b",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  borderBottom: "1px solid #27272a",
                  padding: "16px 24px",
                }}
              >
                <h2 style={{ fontSize: "18px", fontWeight: "500" }}>
                  {consumingTopic ? (
                    <div style={{ display: "flex", alignItems: "center" }}>
                      Consuming from:
                      <span
                        style={{
                          marginLeft: "8px",
                          borderRadius: "9999px",
                          backgroundColor: "#27272a",
                          padding: "4px 12px",
                          fontSize: "14px",
                        }}
                      >
                        {consumingTopic}
                      </span>
                      <div
                        style={{
                          marginLeft: "8px",
                          height: "8px",
                          width: "8px",
                          borderRadius: "9999px",
                          backgroundColor: "#22c55e",
                          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                        }}
                      ></div>
                    </div>
                  ) : (
                    "Select a topic to consume"
                  )}
                </h2>
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div style={{ position: "relative" }} ref={consumerDropdownRef}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "6px",
                        border: "1px solid #3f3f46",
                        backgroundColor: "#27272a",
                        overflow: "hidden",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Search and select topic to consume"
                        value={consumingTopic}
                        onFocus={() => {
                          setConsumerDropdownOpen(true)
                          setProducerDropdownOpen(false)
                        }}
                        onChange={(e) => {
                          setConsumingTopic(e.target.value)
                          setConsumerSearchQuery(e.target.value)
                        }}
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          padding: "8px 16px",
                          color: "white",
                          outline: "none",
                          border: "none",
                        }}
                      />
                      <button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          height: "40px",
                          width: "40px",
                          color: "#a1a1aa",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onClick={() => setConsumerDropdownOpen(!isConsumerDropdownOpen)}
                      >
                        <svg
                          style={{ height: "16px", width: "16px" }}
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {isConsumerDropdownOpen && (
                      <div
                        style={{
                          position: "absolute",
                          zIndex: "10",
                          marginTop: "4px",
                          width: "100%",
                          borderRadius: "6px",
                          border: "1px solid #3f3f46",
                          backgroundColor: "#27272a",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                          {filteredConsumerTopics.length > 0 ? (
                            filteredConsumerTopics.map((topicItem, index) => (
                              <div
                                key={index}
                                onClick={() => handleConsumerTopicSelect(topicItem)}
                                style={{
                                  padding: "8px 16px",
                                  cursor: "pointer",
                                  transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = "#3f3f46"
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = "transparent"
                                }}
                              >
                                {topicItem}
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                padding: "8px 16px",
                                fontSize: "14px",
                                color: "#71717a",
                              }}
                            >
                              No topics found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "6px",
                        border: "1px solid #3f3f46",
                        backgroundColor: "#27272a",
                        overflow: "hidden",
                      }}
                    >
                      <svg
                        style={{ marginLeft: "12px", height: "16px", width: "16px", color: "#a1a1aa" }}
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M21 21L16.65 16.65"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search consumed events..."
                        value={searchQuery}
                        onChange={handleSearch}
                        style={{
                          width: "100%",
                          backgroundColor: "transparent",
                          padding: "8px 12px",
                          color: "white",
                          outline: "none",
                          border: "none",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: "6px",
                      border: "1px solid #3f3f46",
                      backgroundColor: "#27272a",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ height: "256px", overflowY: "auto" }}>
                      {filteredEvents.length > 0 ? (
                        filteredEvents.map((event, index) => (
                          <div
                            key={index}
                            style={{
                              borderBottom: index === filteredEvents.length - 1 ? "none" : "1px solid #3f3f46",
                              padding: "16px",
                            }}
                          >
                            <pre
                              style={{
                                whiteSpace: "pre-wrap",
                                fontFamily: "monospace",
                                fontSize: "12px",
                                color: "#d4d4d8",
                              }}
                            >
                              {highlightQuery(event)}
                            </pre>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            height: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "16px",
                            color: "#71717a",
                          }}
                        >
                          No events found
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  )
}

