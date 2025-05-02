# 📨 nestjs-inbox: Idempotent Messaging Between Microservices with NestJS + Bull + PostgreSQL

This project demonstrates how to implement an **idempotent** message-handling mechanism between two microservices using the **Inbox Table pattern**, with **NestJS**, **PostgreSQL**, and **Bull** (for batch processing).

## ✨ Motivation

Ensuring that a message is not processed more than once is critical in distributed systems. When service A sends data to service B, network failures or retries can cause message duplication.

This project ensures that **each message is processed exactly once**, even in scalable environments (e.g., Kubernetes with multiple replicas).

## 🛠️ Tech Stack

- [NestJS](https://nestjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [TypeORM](https://typeorm.io/)
- [BullMQ](https://docs.bullmq.io/)
- Node.js 22+

## 📌 Core Concepts

### ✅ Inbox Table Pattern

Messages are stored in an intermediate table called `inbox_messages`, acting as a buffer between services.

### ✅ Idempotency

To guarantee each message is processed only once:

- A **compound unique key** is defined on `payload` + `type`
- Duplicate messages are rejected at the DB level

### ✅ Race Conditions & Concurrency

We use `SELECT ... FOR UPDATE SKIP LOCKED` to ensure that:

- Only one instance processes a given message
- Multiple service instances can work in parallel without conflicts

### ✅ Async Processing with Bull

Inbox messages are fetched in batches and processed via a Bull queue with individual error handling:

- If one job fails, others still get processed
- Batch size is configurable

## 🧪 Cluster Testing

To validate scalability:

- The app was **clustered via Node.js** using `os.cpus().length`
- Multiple worker instances were started
- Batch size was set to 1 and a load test was run with duplicate and unique messages

🔍 Result: Each instance picked up different messages, without duplicates or clashes.

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Run the app in clustered mode
npm run start:dev
```

## 📫 Endpoints

| Method | Route  | Description                  |
| ------ | ------ | ---------------------------- |
| POST   | /inbox | Sends a message to the inbox |
| GET    | /inbox | Lists inbox messages         |

## 📂 Structure

```
src/
├── inbox/
│   ├── inbox.controller.ts
│   ├── inbox.service.ts
│   ├── inbox.entity.ts
│   ├── inbox.processor.ts
├── queue/
│   └── bull.config.ts
├── main.ts
```

## 📄 License

MIT
