# Mehedi Tailors & Fabrics — Industrial Bespoke Suite

A production-ready ERP and e-commerce ecosystem designed for high-end tailoring establishments. This suite manages the entire lifecycle of a garment from digital design to industrial tagging and artisan assembly.

---

## 🚀 Quick Start

### Technical Requirements
- **Runtime**: Node.js 18.x or higher
- **Package Manager**: NPM or Yarn
- **Intelligence**: Google Gemini API Key (Required for AI Stylist & Design Consultant)

### Installation Guide
1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Environment Configuration**:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_KEY=your_gemini_api_key
   ```
3. **Execution**:
   ```bash
   npm run dev
   ```

---

## 🏭 Industrial Modules

### **1. Communication Engine (SMTP Bridge)**
Located at `/#/admin/settings`, this module allows administrators to link the atelier's mail server for automated transaction receipts.
- **Gmail Ready**: Pre-configured for `smtp.gmail.com`.
- **Security**: Supports SSL (Port 465) and TLS (Port 587) enforcement.
- **Transactional Logic**: Automatically triggers formatted receipts upon checkout confirmation.
- **Note**: Requires an **App Password** for Google accounts to bypass standard auth security.

### **2. Label Studio & QR Automation**
Navigate to `/#/admin/labels` for high-density physical inventory tagging.
- **Industrial Metadata**: QR codes serialize compressed JSON including SKU, Fabric Quality, and Retail Value.
- **Live Recognition**: Real-time SKU scanning via the browser camera to add items to a print queue.
- **Thermal Calibration**: Layout is optimized for 4x2 industrial thermal printers (e.g., Zebra, Brother).

### **3. Artisan Production Floor**
A station-based workflow for specialized workers:
- **Station 01 (Cutting)**: Drafting silhouettes from digital measurements.
- **Station 02 (Stitching)**: Core assembly and construction.
- **Station 03 (Finishing)**: Pressing, detailing, and artisan embroidery.
- **Station 04 (QC)**: Quality inspection and logistics handover.

### **4. AI Design Consultant**
Powered by Gemini 3 Flash, providing real-time sartorial advice:
- **Styling Tips**: Occasion-based pairing suggestions for specific fabrics.
- **Bespoke Logic**: Technical design recommendations (collars, cuffs, fits) based on garment type.

---

## 🔐 System Credentials

| Role | Access Level | Email | Password |
| :--- | :--- | :--- | :--- |
| **Master Admin** | Full Control | `admin@meheditailors.com` | `admin123` |
| **Head Artisan** | Production Only | `worker@meheditailors.com` | `worker123` |

---

## 🏗 Architecture & State
- **Frontend**: React 19 (TypeScript) + Tailwind CSS.
- **Design Language**: Custom Bespoke UI (Playfair Display for headers, Inter for technical data).
- **Data Layer**: React Context API with persistent LocalStorage "Simulation Mode."
- **Communication**: Bridged SMTP logic for browser-to-mail compatibility.

*Heritage Precision. Digital Excellence. Crafted for Mehedi Tailors.*