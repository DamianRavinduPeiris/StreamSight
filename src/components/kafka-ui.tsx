import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function KafkaUI() {
  const [topic, setTopic] = useState('')
  const [message, setMessage] = useState('')
  const [consumedEvents, setConsumedEvents] = useState<string[]>([])

  const handleProduce = () => {
    socket.emit('produce', { topic, message });
    // This is where you would implement the logic to produce a Kafka event
    console.log(`Producing message to topic ${topic}: ${message}`)
    // For demonstration, we'll just add the message to the consumed events
    setConsumedEvents(prev => [`[${topic}] ${message}`, ...prev])
    setMessage('')
  }

  const handleConsume = () => {
    // This is where you would implement the logic to consume Kafka events
    console.log('Consuming events...')
    // For demonstration, we'll just add a placeholder message
    setConsumedEvents(prev => ['New event consumed (placeholder)', ...prev])
  }

  const formatJSON = (input: string) => {
    try {
      const parsed = JSON.parse(input);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return input; // Return the original input if it's not valid JSON
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">StreamSight</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Produce Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Textarea
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onBlur={(e) => setMessage(formatJSON(e.target.value))}
            style={{ resize: 'both', overflow: 'auto' }}
          />
          <Button onClick={handleProduce} disabled={!topic || !message}>
            Produce Event
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consumed Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleConsume} className="mb-4">
            Consume Events
          </Button>
          <ScrollArea className="h-[300px] w-full border rounded-md p-4">
            {consumedEvents.map((event, index) => (
              <div key={index} className="py-2 border-b last:border-b-0">
                {event}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

