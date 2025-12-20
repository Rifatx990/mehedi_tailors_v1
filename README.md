# Mehedi Tailors & Fabrics — Industrial Bespoke Suite

A production-ready ERP and e-commerce ecosystem designed for high-end tailoring establishments. This suite manages the entire lifecycle of a garment from digital design to industrial tagging and artisan assembly.

---

## 🔐 Technical Architecture Mapping

For developers implementing custom modules or integrating third-party APIs, here is the file responsibility map:

| Module | Primary File | Responsibility |
| :--- | :--- | :--- |
| **Routing** | `App.tsx` | Controls all URL patterns and determines which layout to wrap around pages. |
| **Global State** | `context/StoreContext.tsx` | Central logic for Cart, Orders, Users, and Database synchronization. |
| **Auth Guards** | `components/ProtectedRoute.tsx` | Prevents unauthorized access to Admin/Worker/Customer dashboards. |
| **Persistence** | `services/DatabaseService.ts` | Handles the IndexedDB "virtual file system" to mimic a `database.json`. |
| **Checkout** | `pages/CheckoutPage.tsx` | Payment method selection and order object construction before placement. |
| **Bespoke Logic** | `pages/CustomTailoringPage.tsx` | Multi-step configuration for tailored garments and Gemini AI integration. |
| **Messaging** | `context/StoreContext.tsx` | The `sendEmail` function handles automated transactional dispatches. |

---

## 💳 SSLCommerz Integration Guide

To transition from "Simulation Mode" to live digital payments via SSLCommerz, follow these architectural steps:

### 1. Backend Endpoint (Required)
SSLCommerz is a server-to-server protocol. You must create a PHP or Node.js endpoint to handle the `init` request.
- **Route to Modify**: `pages/CheckoutPage.tsx`
- **Action**: In `handleSubmit`, if `paymentMethod === 'sslcommerz'`, replace the `setTimeout` simulation with a `fetch()` call to your payment init endpoint.

### 2. Implementation Workflow
1.  **Initiate**: Send `total_amount`, `cus_email`, and `tran_id` to your backend.
2.  **Redirect**: Your backend calls SSLCommerz API and returns a `GatewayPageURL`. Redirect the user in the frontend using `window.location.href = data.GatewayPageURL`.
3.  **IPN (Instant Payment Notification)**: SSLCommerz will POST to your server. Your server must then update the order in the database.
4.  **Handle Redirects**:
    -   **Success**: Point to `/#/order-success/[orderId]`.
    -   **Fail**: Point to a new `/#/payment-fail` route (to be created in `App.tsx`).
    -   **Cancel**: Point to `/#/cart`.

### 3. File Updates Required
-   **`types.ts`**: Update `PaymentStatus` to include `Pending Verification`.
-   **`context/StoreContext.tsx`**: Add an `updateOrderPayment` function that can be called after a successful IPN handshake.

---

## 🏭 Industrial Modules

### **1. Communication Engine (SMTP Bridge)**
Located at `/#/admin/settings`, this module allows administrators to link the atelier's mail server.
-   **Management**: Admins can Add, Edit, or Remove SMTP credentials via the Dashboard.
-   **Security**: Supports SSL (Port 465) and TLS (Port 587) enforcement.
-   **Virtual Outbox**: All dispatches are logged in `pages/admin/AdminOutboxPage.tsx`.

### **2. Label Studio & QR Automation**
Navigate to `/#/admin/labels` for high-density physical inventory tagging.
-   **Industrial Metadata**: QR codes serialize compressed JSON including SKU and Retail Value.
-   **Thermal Calibration**: Optimized for 4x2 industrial thermal printers.

---

## 🔐 System Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Master Admin** | `admin@meheditailors.com` | `admin123` |
| **Head Artisan** | `worker@meheditailors.com` | `worker123` |

*Heritage Precision. Digital Excellence. Crafted for Mehedi Tailors.*