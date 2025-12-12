# Hotel - Food Order, Stock, and Daily Analytics System

A comprehensive Point of Sale (POS) system for Janatha Hotel food ordering, stock management, and daily analytics. Built with React, Vite, TypeScript, Zustand, Axios, and Socket.IO.

## Features

### Admin Features
- **Item Management**: Create, update, and delete menu items with item numbers, categories, prices, and units
- **Stock Entry**: Daily starting stock entry per item with tracking

### POS Features
- **Numeric Order Entry**: Quick order entry using item numbers
- **Table-Based Orders**: Manage orders by table with status tracking
- **Real-time Updates**: Socket.IO integration for live order updates

### Analytics & Reports
- **Daily Sales Report**: View total orders, revenue, and top-selling items
- **Daily Stock Report**: Track starting stock, current stock, and sold quantities
- **Stock Suggestions**: Get AI-powered suggestions for restocking based on sales patterns

### Kitchen Display System (KDS)
- **Real-time KDS View**: Kitchen display for order preparation tracking
- **Order Status Management**: Track items from pending to ready

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **React Router** - Navigation
- **date-fns** - Date formatting
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── Button.tsx       # Button component
│   ├── Card.tsx         # Card component
│   ├── Input.tsx        # Input component
│   └── Modal.tsx        # Modal component
├── pages/               # Page components
│   ├── AdminItems.tsx   # Item management page
│   ├── StockEntry.tsx   # Stock entry page
│   ├── POSOrder.tsx     # POS order entry page
│   ├── TableOrders.tsx  # Table orders page
│   ├── DailyReports.tsx # Reports page
│   └── KDSView.tsx      # Kitchen display system
├── stores/              # Zustand stores
│   ├── itemStore.ts     # Item state management
│   ├── orderStore.ts    # Order state management
│   ├── stockStore.ts    # Stock state management
│   ├── reportStore.ts   # Report state management
│   └── tableStore.ts    # Table state management
├── services/            # API and service layer
│   ├── api.ts           # Axios API client
│   └── socket.ts        # Socket.IO client
├── types/               # TypeScript type definitions
│   └── index.ts         # All type definitions
├── App.tsx              # Main app component with routing
└── main.tsx             # Entry point
```

## API Integration

The application expects a REST API with the following endpoints:

### Items
- `GET /api/items` - Get all items
- `GET /api/items/:id` - Get item by ID
- `GET /api/items/item-no/:itemNo` - Get item by item number
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Stock
- `GET /api/stock/date/:date` - Get stock entries by date
- `POST /api/stock` - Create stock entry
- `PUT /api/stock/:id` - Update stock entry
- `GET /api/stock/item/:itemId/current` - Get current stock for item

### Orders
- `GET /api/orders` - Get all orders (with optional query params: date, status)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/table/:tableNo` - Get orders by table
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status

### Reports
- `GET /api/reports/sales/:date` - Get daily sales report
- `GET /api/reports/stock/:date` - Get daily stock report
- `GET /api/reports/suggestions/:date` - Get stock suggestions

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `PATCH /api/tables/:id/status` - Update table status

### Socket.IO Events

The application listens for the following Socket.IO events:
- `kds:order:new` - New order for KDS
- `kds:order:update` - Order update for KDS
- `kds:item:update` - Item status update for KDS
- `order:status:update` - Order status update

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for the REST API (default: `http://localhost:5000/api`)
- `VITE_SOCKET_URL` - Socket.IO server URL (default: `http://localhost:5000`)

## License

MIT

