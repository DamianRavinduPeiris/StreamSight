# StreamSight

**StreamSight** is a lightweight yet powerful web application built to consume and produce real-time Kafka events via a **Socket.IO** interface. Developed with **KafkaJS**, it offers a streamlined way to work with real-time data streams.

**Backend Repository** [can be found from here.](https://github.com/DamianRavinduPeiris/kafka-ts)


## Installation & Setup

### Backend Configuration

Please follow the instructions in [here](https://github.com/DamianRavinduPeiris/kafka-ts) to set up and configure the backend service.

### Frontend Setup

#### Prerequisites

Ensure the following tools are installed:

- **Node.js** (v16.x or higher)
- **Kafka** (locally or via a cloud provider such as Confluent Cloud)
- **npm** or **yarn**

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/DamianRavinduPeiris/StreamSight.git

2. **Navigate to the project directory**
   ```bash
   cd StreamSight

3. **Install dependencies**
   Using npm:
   ```bash
   npm install
   ```
   Or using yarn:
   ```bash
   yarn install

4. **Configure the Socket endpoint**

   Update the Socket.IO server endpoint in `kafka-ui.tsx`:

   ![Socket Endpoint Config](https://github.com/user-attachments/assets/6d6734a1-287d-4cdb-ab34-b91d99ed9c9a)

5. **Start the application**
   Using npm:
   ```bash
   npm run start
   ```
   Or using yarn:
   ```bash
   yarn start
   ```

6. **Access the app**

   Open your browser and go to:  
   `http://localhost:3000`

## Features

### Consume Events

- Listen to Kafka topics and stream real-time events to connected clients via **Socket.IO**.

### Produce Events

- Publish events to configured Kafka topics directly from the client interface.


## Use Cases

- **Real-Time Analytics**  
  Visualize and monitor Kafka events as they happen.

- **Streaming Applications**  
  Enable interactive, low-latency communication between services and clients.


## Screenshots

### 1) Producing Events  
![Producing Events](https://github.com/user-attachments/assets/55e08de7-c6c4-4f96-b9f6-b4e0d8d91fec)


### 2) Consuming Events  
![Consuming Events](https://github.com/user-attachments/assets/b850e4e3-1477-4eba-b7e4-584ff20b2821)


### 3) Searching Through Events  
![Searching Events](https://github.com/user-attachments/assets/3c43a1df-3929-434a-bcbd-f465ad35905d)


## Contribution Guidelines

We welcome contributions from the community!

### How to Contribute

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature description"
   ```
4. Push your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request for review.

### Reporting Issues

If you discover any bugs or have feature suggestions, please open an issue with a clear and descriptive explanation.


## License

This project is licensed under the [MIT License](LICENSE).


Made with ❤️ by **Damian.**
