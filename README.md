### StreamSight  

**StreamSight** is a simple yet powerful web application designed to consume and produce real-time Kafka events through a **Socket.IO** wrapper. Built with KafkaJS, this application provides a seamless interface for working with real-time data streams.

Backend repo can be found in <a href="https://github.com/DamianRavinduPeiris/kafka-ts">here.</a>

## Installation and Setup

To set up and run the project locally, follow these steps:

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16.x or higher)
- **Kafka** (locally or via a cloud provider like Confluent Cloud)
- **npm** or **yarn** for package management

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/DamianRavinduPeiris/StreamSight.git
   ```
2. Navigate to the project directory:
   ```bash
   cd StreamSight
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   Or, if using Yarn:
   ```bash
   yarn install
   ```
4. Configure Socket endpoint in `kafka-ui.tsx`:
   
   - ![image](https://github.com/user-attachments/assets/6d6734a1-287d-4cdb-ab34-b91d99ed9c9a)


6. Start the application:
   ```bash
   npm run start
   ```
   Or, if using Yarn:
   ```bash
   yarn start
   ```

7. Access the application:
   - Open your browser and navigate to `http://localhost:3000` (default port).

---

## Usage

### Features
- **Consume Events**:
  - The application listens to Kafka topics and streams real-time events to connected clients via **Socket.IO**.
- **Produce Events**:
  - Clients can produce events, which are then published to the configured Kafka topics.

### Use Cases
- **Real-Time Analytics**:
  - Monitor and visualize Kafka events in real time.
- **Streaming Applications**:
  - Enable real-time communication between clients and servers.

---


## Screenshots

### 1) Producing Events  
![Producing Events](https://github.com/user-attachments/assets/55e08de7-c6c4-4f96-b9f6-b4e0d8d91fec)  

---

### 2) Consuming Events  
![Consuming Events](https://github.com/user-attachments/assets/b850e4e3-1477-4eba-b7e4-584ff20b2821)  

---

### 3) Searching Through Consumed Events  
![Searching Events](https://github.com/user-attachments/assets/3c43a1df-3929-434a-bcbd-f465ad35905d)  

---

## Contribution Guidelines

Contributions are welcome! Here's how you can contribute:

1. Fork the repository.
2. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

### Reporting Issues
If you encounter any issues, please open an issue in the repository with a detailed description.

---

## License

This project is licensed under the [MIT License](LICENSE).
