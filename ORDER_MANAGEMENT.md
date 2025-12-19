# Order Management System Documentation

## Overview
Professional order management system with automatic stock validation and deduction for the Ornella Admin Portal.

## Features

### 1. Stock Management
- **Automatic Stock Validation**: When an order status changes from "pending" to "processing", the system automatically validates stock availability for all items
- **Stock Deduction**: If stock is available, quantities are automatically deducted from inventory when order is accepted
- **Real-time Alerts**: Admins receive instant feedback if stock is insufficient

### 2. Order Statuses
The system uses 5 core statuses:
- **Pending**: New orders awaiting review
- **Processing**: Orders accepted and stock deducted (inventory committed)
- **Shipped**: Orders dispatched for delivery
- **Delivered**: Orders successfully delivered to customer
- **Cancelled**: Orders cancelled (stock not deducted)

### 3. Pricing Breakdown
Each order card displays:
- **Subtotal**: Sum of all item prices
- **Delivery Fee**: Shipping charges
- **Total Amount**: Final amount (Subtotal + Delivery Fee)

### 4. Enhanced Order Details
- Customer information (name, phone, address)
- Item-wise pricing breakdown
- Quantity × Unit Price display
- Order date and ID

## How It Works

### Stock Validation Flow
```
Pending → Processing
    ↓
Check Stock
    ↓
┌─────────────────┬─────────────────┐
│ Stock Available │ Stock Insufficient│
└────────┬────────┴─────────┬────────┘
         ↓                   ↓
   Deduct Stock         Show Alert
         ↓                   ↓
   Update Status      Status Unchanged
```

### Stock Deduction
When status changes from "pending" to "processing":
1. System fetches all order items
2. Validates stock for each product
3. If any item has insufficient stock:
   - Shows detailed alert with item names and quantities
   - Does NOT update order status
   - Does NOT deduct any stock
4. If all items have sufficient stock:
   - Deducts quantities from product inventory
   - Updates order status to "processing"
   - Updates product's `updatedAt` timestamp

### Error Handling
- **Insufficient Stock**: Clear alert showing which items need restocking
- **Product Not Found**: Treats as 0 stock available
- **Network Errors**: User-friendly error messages

## Migration Guide

### For Existing Orders
Run the migration script to update old orders:

```bash
npx ts-node scripts/update-orders-schema.ts
```

This script:
- Adds `subtotal` and `deliveryFee` fields to existing orders
- Calculates subtotal from order items
- Derives delivery fee from total amount
- Defaults to Rs. 200 delivery fee if calculation fails

## Database Schema

### Order Interface
```typescript
interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;          // NEW
  deliveryFee: number;       // NEW
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod';
  paymentStatus: 'pending' | 'paid';
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## API Functions

### `validateOrderStock(orderId: string)`
Checks if sufficient stock exists for all items in an order.

**Returns:**
```typescript
{
  valid: boolean;
  insufficientItems: Array<{
    productId: string;
    title: string;
    requested: number;
    available: number;
  }>;
}
```

### `deductOrderStock(orderId: string)`
Deducts stock quantities for all items in an order.

**Throws:** Error if stock is insufficient

### `updateOrderStatusWithStockManagement(orderId, newStatus, currentStatus)`
Updates order status with automatic stock management.

**Returns:**
```typescript
{
  success: boolean;
  error?: string;
  stockIssues?: Array<{...}>;
}
```

## Best Practices

1. **Always Use Status Change Handler**: Don't directly update order status - use the provided handler that manages stock
2. **Monitor Stock Levels**: Regularly check product inventory to avoid fulfillment issues
3. **Handle Alerts**: When stock alerts appear, restock products before processing orders
4. **Cancelled Orders**: Stock is NOT deducted for cancelled orders
5. **Order History**: Product snapshots preserve historical data even if products are deleted

## UI Features

- **Loading States**: Visual feedback during status updates
- **Disabled Controls**: Prevents multiple simultaneous updates
- **Detailed Alerts**: Clear messaging about stock issues
- **Responsive Cards**: Professional order card layout
- **Status Badges**: Color-coded status indicators with icons

## Future Enhancements

Potential improvements:
- Automatic restock notifications
- Bulk order processing
- Order export functionality
- Advanced filtering and search
- Order cancellation with stock restoration
- Partial fulfillment support
- Integration with shipping providers
