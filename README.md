# CDC Integration with Kafka and Debezium

This project demonstrates an integration of **Change Data Capture (CDC)** using **Kafka**, **Debezium**, and **Kafka Connect**. It showcases how to stream database changes in real-time, enabling the tracking of modifications like inserts, updates, and deletes in the database. The project is also integrated with a frontend built with React and tailwindCSS for monitoring logs generated during the CDC process.

## Technologies Used

- **Kafka**: Distributed streaming platform to handle real-time data streams.
- **Debezium**: Open-source CDC platform that tracks changes in the database.
- **Kafka Connect**: Framework for connecting Kafka with external systems (including databases).
- **.NET Core API**: Api that consumes the Kafka topics and SignalR for frontend communication
- **React**: Frontend framework for creating the UI to monitor the CDC logs.
- **TailwindCSS**: Utility-first CSS framework for styling the frontend.

## Project Structure

- **Backend**: Contains the configuration for Kafka, Debezium, and Kafka Connect to capture database changes.
- **Frontend**: A React application that connects to the backend and displays logs and SQL queries from Kafka.
- **Docker**: The entire project is containerized using Docker.

## Getting Started

To run this project locally using Docker, follow the steps below.

### Prerequisites

Make sure you have the following installed:

- **Docker** and **Docker Compose**: To run the backend and frontend containers.
- **Node.js** and **npm/yarn** (for frontend build).
- **.NET** for backend
- **Kafka**, **Debezium**, and **Zookeeper** Docker images (configured in the Docker Compose file).

### Running the Project

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/HeitorSG/CDC-Example
    cd CDC-Example
    ```

2. **Start the containers** using Docker Compose:
    ```bash
    docker-compose up --build
    ```

    This will start:
    - **Kafka**
    - **Zookeeper**
    - **Debezium Connector**
    - **Postgres**
    - **Backend** consumer and SignalR for frontend
    - **Frontend (React application)**

4. **Create the Debezium Connector**:

  To create the Debezium PostgreSQL connector, run the following `curl` command:
```bash
curl -X POST -H "Content-Type: application/json" \
--data '{
  "name": "postgres-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "postgres",
    "database.password": "postgres",
    "database.dbname": "demo",
    "database.server.name": "demo",
    "plugin.name": "pgoutput",
    "publication.name": "debezium_pub",
    "slot.name": "debezium_slot"
  }
}' \
http://localhost:8083/connectors
```



5. **Access the Frontend**:
    Once the backend is up and running, you can access the frontend at the following URL:

    ```bash
    http://localhost:5173
    ```

    Here, you can see the logs from Kafka and interact with the CDC process.

## Project Setup

### Backend Configuration

- Kafka is configured to run with Zookeeper, and it uses **Debezium** to track changes in the database.
- The **Kafka Connect** service is responsible for connecting Debezium to Kafka.
- The C# backend service consumes the messages from kafka and sends the log to the frontend

### Frontend Configuration

- React frontend is responsible for displaying the logs generated from the CDC process.
- **TailwindCSS** is used to style the application.

## Troubleshooting

- If you're facing CORS issues, ensure the backend allows connections from the frontend by configuring the appropriate CORS headers.
- The project relies on Docker to manage the environment, so ensure that Docker is running and there are no conflicts with existing containers.
