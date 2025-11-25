# 🔧 HazzlFree – Local Service Marketplace (MERN Stack)

A complete **service marketplace** application built using the **MERN Stack**.  
Users can register as **Service Providers** (e.g., plumbers, electricians) or **Consumers** looking for services.  
An **Admin Dashboard** ensures service quality by approving or rejecting provider submissions.

---

## 🚀 Features

### 🔹 User Roles
| Role | Capabilities |
|------|--------------|
| **Consumer** | Browse approved services, view provider details, contact providers |
| **Provider** | Create & manage service listings with images, track approval status |
| **Admin** | Approve/reject provider services before they become public |

---

### 🛡️ Admin Dashboard (Platform Moderation)
- Review all services submitted by providers  
- Approve/Reject submissions  
- Control marketplace content and maintain trust  
- Only **approved** services become visible to consumers

> **Approval Workflow:**  
Provider ➝ Submit Service ➝ Admin Approves ➝ Visible to Consumers

---

### 🔐 Authentication & Security
- Role-based authentication using **JWT**
- **Access + Refresh tokens** for secure session handling
- Password encryption with **bcrypt**

---

### 📸 Media & Upload Handling
- **Multer** to handle file uploads
- **Cloudinary** for secure image hosting

---

### 🎯 Smooth Form UX + Validation
- **React Hook Form** for optimized form control
- **Zod** for schema validation & better error handling

---

### 🧠 Backend Architecture
- Fully structured **RESTful API**
- MongoDB + Mongoose for database management

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, React Router, React Hook Form, Zod, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| File Uploads | Cloudinary, Multer |

---


