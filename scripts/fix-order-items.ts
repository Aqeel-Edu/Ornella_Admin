/**
 * Script to fix existing orders that are missing productId in items
 * This adds productId to order items so stock deduction can work
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixOrderItems() {
  console.log('🔄 Starting to fix order items...\n');

  try {
    // Get all orders
    const ordersSnapshot = await getDocs(collection(db, 'orders'));
    console.log(`📋 Found ${ordersSnapshot.size} orders\n`);

    // Get all products to create a lookup by title
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const productsByTitle = new Map();
    
    productsSnapshot.forEach((doc) => {
      const product = doc.data();
      productsByTitle.set(product.title.toLowerCase(), {
        id: doc.id,
        ...product
      });
    });

    console.log(`📦 Loaded ${productsByTitle.size} products for matching\n`);

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each order
    for (const orderDoc of ordersSnapshot.docs) {
      const order = orderDoc.data();
      const orderId = orderDoc.id;

      console.log(`\n🔍 Checking order ${orderId}...`);

      if (!order.items || !Array.isArray(order.items)) {
        console.log(`   ⚠️ No items array, skipping`);
        skippedCount++;
        continue;
      }

      let needsUpdate = false;
      const updatedItems = order.items.map((item: any, index: number) => {
        // If productId already exists, no need to update
        if (item.productId) {
          console.log(`   ✅ Item ${index + 1}: Already has productId`);
          return item;
        }

        // Try to find product by title
        const product = productsByTitle.get(item.title?.toLowerCase());
        
        if (product) {
          console.log(`   ✅ Item ${index + 1}: Found product for "${item.title}" - ${product.id}`);
          needsUpdate = true;
          return {
            ...item,
            productId: product.id
          };
        } else {
          console.log(`   ❌ Item ${index + 1}: Could not find product for "${item.title}"`);
          return item;
        }
      });

      // Update the order if needed
      if (needsUpdate) {
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            items: updatedItems
          });
          console.log(`   💾 Updated order ${orderId}`);
          fixedCount++;
        } catch (error) {
          console.error(`   ❌ Error updating order ${orderId}:`, error);
          errorCount++;
        }
      } else {
        console.log(`   ℹ️ No update needed`);
        skippedCount++;
      }
    }

    console.log('\n\n📊 Summary:');
    console.log(`   ✅ Fixed: ${fixedCount} orders`);
    console.log(`   ⏭️ Skipped: ${skippedCount} orders`);
    console.log(`   ❌ Errors: ${errorCount} orders`);
    console.log('\n✅ Done!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
fixOrderItems()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
