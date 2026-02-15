# Postman Collection

This directory contains a comprehensive Postman collection for the Trip Manager API, including automated tests for health checks, trip search, and trip management.

## 📂 Contents

- `Tech-Challenge-Collection.json`: The exported Postman collection with requests, examples, and scripts.

## 🚀 Getting Started

### 1. Import Collection
1. Open Postman.
2. Click **Import** in the top-left corner.
3. Drag and drop the `Tech-Challenge-Collection.json` file.

### 2. Environment Configuration
The collection uses a Collection Variable `baseUrl` which defaults to:
- `http://localhost:3000`

If your API is running on a different port or host, you can:
- Edit the `baseUrl` variable in the Collection settings.
- Or create a Postman Environment with a `baseUrl` variable.

### 3. Running Tests
You can run the tests manually or using the Collection Runner.

#### Manual Testing
1. Send a request (e.g., `Health Checks > 1. Liveness Check`).
2. Check the **Test Results** tab in the response panel.

#### Automated Testing (Collection Runner)
1. Select the **Tech Challenge - Trip Manager API** collection.
2. Click **Run**.
3. Verify that all tests pass (Health, Search flow, CRUD operations).

## 🧪 Test Scenarios

The collection covers the following scenarios:

### Health Checks
- **Live** (`/health/live`): Verifies the API is up.
- **Ready** (`/health/ready`): Verifies DB connection.
- **Detailed** (`/health/detailed`): Checks external API connectivity.

### Trip Search
- **Search Trips**: Searches for trips and automatically captures data (ID, origin, destination, etc.) into collection variables for subsequent requests.

### Saved Trips (Trip Manager)
- **Save Trip**: Saves a trip using data captured from the search.
- **Save Another Trip**: Verifies session consistency.
- **Get All Saved Trips**: Verifies data persistence and retrieval.
- **Delete Saved Trip**: Removes a trip and verifies 204 status.
- **Verify Deletion**: Confirms the trip is no longer in the list.
