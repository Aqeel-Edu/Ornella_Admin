/**
 * Script to update existing orders with subtotal and deliveryFee fields
 * Run this once to migrate existing orders to the new schema
 */

import { db } from '../lib/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const DELIVERY_FEE = 200; // Default delivery fee in Rs.

async function updateOrdersSchema() {
  try {
    console.log('Starting orders schema update...');
    
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    
    console.log(`Found ${snapshot.size} orders to update`);
    
    let updated = 0;
    
    for (const orderDoc of snapshot.docs) {
      const orderData = orderDoc.data();
      
      // Check if order already has the new fields
      if (orderData.subtotal !== undefined && orderData.deliveryFee !== undefined) {
        console.log(`Order ${orderDoc.id} already updated, skipping...`);
        continue;
      }
      
      // Calculate subtotal from items
      let subtotal = 0;
      if (orderData.items && Array.isArray(orderData.items)) {
        subtotal = orderData.items.reduce((sum: number, item: any) => {
          return sum + (item.price * item.quantity);
        }, 0);
      }
      
      // Calculate delivery fee (existing totalAmount - subtotal, or default)
      let deliveryFee = DELIVERY_FEE;
      if (orderData.totalAmount) {
        const calculatedDeliveryFee = orderData.totalAmount - subtotal;
        if (calculatedDeliveryFee >= 0 && calculatedDeliveryFee <= 1000) {
          deliveryFee = calculatedDeliveryFee;
        }
      }
      
      // Update the order
      await updateDoc(doc(db, 'orders', orderDoc.id), {
        subtotal,
        deliveryFee,
        totalAmount: subtotal + deliveryFee,
      });
      
      updated++;
      console.log(`Updated order ${orderDoc.id}: subtotal=${subtotal}, deliveryFee=${deliveryFee}`);
    }
    
    console.log(`\nSchema update complete! Updated ${updated} orders.`);
  } catch (error) {
    console.error('Error updating orders schema:', error);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  updateOrdersSchema()
    .then(() => {
      console.log('Success!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

export { updateOrdersSchema };
