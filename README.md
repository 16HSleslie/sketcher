# MEAN Stack Application

A full-stack web application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js).

## Prerequisites

- Node.js 
- npm
- MongoDB (local or Atlas)
- Angular CLI

## Getting Started

1. Clone the repository
```
git clone <repository-url>
cd mean-stack-app
```

2. Install dependencies
```
npm install
```

3. Configure environment variables
   - Create a `.env` file in the root directory
   - Set your MongoDB connection string

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/mean-stack-app
```

4. Run the application in development mode
```
npm run dev
```

This will start both the backend server and the Angular development server.

## Project Structure

```
├── app/                     # Server-side code
│   ├── models/              # MongoDB models
│   ├── middlewares/         # Express middlewares
│   ├── routes/              # API routes
├── src/                     # Angular source code
├── dist/                    # Angular build output
├── server.js                # Express server entry point
├── config.js                # Server configuration
├── package.json             # Project dependencies
├── angular.json             # Angular CLI configuration
└── README.md                # Project documentation
```

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate user and get token
- `GET /api/users` - Get all users (protected)

## Testing

This project includes both backend and frontend tests.

### Running Tests

```
# Run all tests (backend and frontend)
npm test

# Run only backend tests
npm run test:server

# Run only frontend tests
npm run test:client

# Run backend tests in watch mode
npm run test:watch

# Run end-to-end tests
npm run test:e2e
```

### Test Structure

```
├── test/                    # Test files
│   ├── server/              # Backend tests
│   │   ├── users.test.js    # User API tests
│   │   ├── db.test.js       # Database connection tests
│   │   ├── server.test.js   # Server route tests
│   ├── run-tests.js         # Script to run all tests
├── src/app/                 # Frontend tests (*.spec.ts files)
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 