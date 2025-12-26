# Digital Bookstore Inventory & Reporting System

A robust backend system built with **Node.js**, **Express**, and **Sequelize** for managing bookstore inventory via CSV synchronization and generating detailed store performance reports in PDF format.

## Tech Stack

    Runtime: Node.js with TypeScript
    Framework: Express.js
    ORM: Sequelize (SQL-based)
    Database: SQLite (Used for portability in this challenge, easily swappable to PostgreSQL)
    PDF Generation: PDFKit
    CSV Parsing: fast-csv

## Quick Start (Docker)

The fastest way to get the system running is using Docker Compose. This will spin up the Node.js application and the database environment.

```bash
# Clone the repository
git clone <your-repo-link>
cd <repo-folder>
```

rename `.env.example` to `.env`

```bash
# Start the containers
docker-compose up --build
```

## Timing

Started At `7:05 PM` -> `12:05 AM` (5 Hours)
