# QRGanic API Documentation

Complete API documentation for testing with Postman.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

---

## 1. Authentication Routes

### 1.1 Register User
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",
  "address": "123 Main St, City",
  "contact": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": {
    "id": "<mongodb_id>",
    "userId": "customer-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 1.2 Login
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "<jwt_token>",
  "user": {
    "id": "<mongodb_id>",
    "userId": "customer-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "address": "123 Main St",
    "contact": "+1234567890",
    "fpoId": "",
    "farmerApplication": {
      "status": "none"
    }
  }
}
```

**Note:** Save the token from this response for authenticated requests.

---
farmer :-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzU3ZTIyYTU1ZTMxZjNjNWE5NmZmYiIsImlhdCI6MTc2NTExMzM4OCwiZXhwIjoxNzY1NzE4MTg4fQ.bbbb1QuW6hC1uP6aRS7ia5AnU8yw8dZExg0ISOwi4r0


User:- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImN1c3RvbWVyLTcyN2xkeCIsImlhdCI6MTc2NTExNDEwNywiZXhwIjoxNzY1NzE4OTA3fQ.0zbhr1iLpyyVqc7NXIrjGGCdzV3NS7Suy3ABkdGNjbw

FPO :- eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImZwby1maHcybW0iLCJpYXQiOjE3NjUxMTM4NzMsImV4cCI6MTc2NTcxODY3M30.WN9Ra3YMoGa-pkfPVimognL_3pNtdaqx6qWq_OogGoE

Admin:-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLW15YW1rcyIsImlhdCI6MTc2NTExMzkwNSwiZXhwIjoxNzY1NzE4NzA1fQ.h2zpMPq5vPlZIz6lkU4L82_6-lrvO3hIy2VDZlTbvG0

### 1.3 Get Current User
**GET** `/auth/me`

**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "<mongodb_id>",
    "userId": "customer-abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "address": "123 Main St",
    "contact": "+1234567890",
    "fpoId": "",
    "farmerApplication": {
      "status": "none"
    }
  }
}
```

---

## 2. User & Farmer Product Marketplace

### 2.1 Get All Products (Marketplace)
**GET** `/user/products`

**Access:** Private (User, Farmer)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "products": [
    {
      "_id": "<mongodb_id>",
      "productId": "product-xyz123",
      "name": "Organic Rice",
      "productType": "Food",
      "harvestTime": "2025-12-01T00:00:00.000Z",
      "expirationDate": "2026-01-01T00:00:00.000Z",
      "dueDate": "2025-12-15T00:00:00.000Z",
      "manuresUsed": "Compost",
      "fertilizersUsed": "None",
      "testsDone": "LabTest2025",
      "initialPrice": 100,
      "finalPrice": 120,
      "quantity": "50kg",
      "quality": "Grade A",
      "location": "Village A",
      "userId": "customer-utz42g",
      "fpoId": "fpo-abc123",
      "certificationStatus": "certified",
      "status": "active"
    }
  ]
}
```

**Note:**
- The `userId` and `fpoId` fields are string IDs, not objects. If you need user details (name, address, etc.), you must fetch them separately using the `userId` returned in each product.
- The endpoint and request remain the same; only the response format for `userId`/`fpoId` is now a string.

---

### 2.2 Purchase a Product
**POST** `/user/purchase`

**Access:** Private (User, Farmer)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "productId": "product-xyz123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Purchase successful! QR code has been sent to your email."
}
```

**Errors:**
- 400: Only users and farmers can purchase products
- 404: Product not found
- 400: Product is not available
- 400: You cannot purchase your own products
- 401: Not authorized to access this route

---

### 2.3 Apply to Become a Farmer
**POST** `/user/apply-farmer`

**Access:** Private (User)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "farmingType": "Organic",
  "location": "Village A",
  "cultivatedProducts": ["Rice", "Wheat"],
  "proofDocuments": []
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Application submitted successfully!",
  "application": {
    "status": "pending",
    "farmingType": "Organic",
    "location": "Village A",
    "cultivatedProducts": ["Rice", "Wheat"],
    "appliedAt": "2025-12-07T12:00:00.000Z"
  }
}
```

---

## 3. Farmer Product Management

### 3.1 Get My Products
**GET** `/farmer/products`

**Access:** Private (Farmer)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "products": [ ... ]
}
```

### 3.2 Add a Product
**POST** `/farmer/products`

**Access:** Private (Farmer)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Organic Rice",
  "productType": "Food",
  "harvestTime": "2025-12-01T00:00:00.000Z",
  "expirationDate": "2026-01-01T00:00:00.000Z",
  "dueDate": "2025-12-15T00:00:00.000Z",
  "manuresUsed": "Compost",
  "fertilizersUsed": "None",
  "testsDone": "LabTest2025",
  "initialPrice": 100,
  "finalPrice": 120,
  "quantity": "50kg",
  "quality": "Grade A",
  "location": "Village A"
}
```

**Response (201):**
```json
{
  "success": true,
  "product": { ... }
}
```

### 3.3 Remove a Product
**DELETE** `/farmer/products/:productId`

**Access:** Private (Farmer)

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product removed successfully!"
}
```

---

## 4. Error Responses

- 401 Unauthorized: `{ "success": false, "message": "Not authorized to access this route" }`
- 403 Forbidden: `{ "success": false, "message": "User role '<role>' is not authorized to access this route" }`
- 404 Not Found: `{ "success": false, "message": "Product not found" }`
- 400 Bad Request: `{ "success": false, "message": "<reason>" }`

---

## Notes
- All endpoints requiring authentication must include the Bearer token in the Authorization header.
- Product IDs are string-based (e.g., `product-xyz123`).
- User IDs are string-based (e.g., `customer-ojxojc`).
- For more endpoints (admin, FPO, logs, etc.), see the full backend code.


---



---

## 4. FPO Product Management

### 4.1 Get All FPO Products
**GET** `/fpo/products`
**Response (200):**
```json
{
  "success": true,
  "products": [ ... ]
}
```

### 4.2 Get Expired FPO Products
**GET** `/fpo/products/expired`
**Response (200):**
```json
{
  "success": true,
  "products": [ ... ]
}
```

### 4.3 Remove Expired Product
**PUT** `/fpo/products/:productId/remove`
**Response (200):**
```json
{
  "success": true,
  "message": "Product removed successfully!"
}
```

---

## 5. Admin Dashboard & Management

### 5.1 Get Admin Dashboard
**GET** `/admin/dashboard`
**Response (200):**
```json
{
  "success": true,
  "stats": { ... },
  "allUsers": [ ... ],
  "allProducts": [ ... ]
}
```

### 5.2 Get All Users
**GET** `/admin/users`
**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "users": [ ... ]
}
```

### 5.3 Get All FPOs
**GET** `/admin/fpos`
**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "fpos": [ ... ]
}
```

### 5.4 Get All Farmers
**GET** `/admin/farmers`
**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "farmers": [ ... ]
}
```

---

## 6. Log API

### 6.1 Get All Logs
**GET** `/logs`
**Response (200):**
```json
{
  "success": true,
  "logs": [ ... ]
}
```

### 6.2 Get Logs for a Product
**GET** `/logs/product/:productId`
**Response (200):**
```json
{
  "success": true,
  "logs": [ ... ]
}
```

---

## 7. Visual API

### 7.1 Get All Visuals
**GET** `/visuals`
**Response (200):**
```json
{
  "success": true,
  "visuals": [ ... ]
}
```

### 7.2 Get Visuals for a Product
**GET** `/visuals/product/:productId`
**Response (200):**
```json
{
  "success": true,
  "visuals": [ ... ]
}
```

---

## 8. Error Responses
- 401 Unauthorized: `{ "success": false, "message": "Not authorized to access this route" }`
- 403 Forbidden: `{ "success": false, "message": "User role '<role>' is not authorized to access this route" }`
- 404 Not Found: `{ "success": false, "message": "Product not found" }`
- 400 Bad Request: `{ "success": false, "message": "<reason>" }`

---

## Notes
- All endpoints requiring authentication must include the Bearer token in the Authorization header.
- Product IDs and User IDs are string-based.
- For more endpoints (admin, FPO, etc.), see the backend code.

