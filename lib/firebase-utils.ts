"use client"

import { db, storage } from "./firebaseConfig"
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
  orderBy
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import {
  Product,
  Category,
  SEO,
  FeaturedItem,
  Order,
  CreateProduct,
  CreateCategory,
  CreateSEO,
  CreateFeaturedItem,
  CreateOrder,
  Blog,
  CreateBlog
} from "../types/schema"

// --- Shared types -------------------------------------------------
interface OrderFilters {
  startDate?: Date
  endDate?: Date
  status?: Order['status']
  productId?: string
  categoryId?: string
  minAmount?: number
  maxAmount?: number
}

// Helper: remove undefined fields (Firestore rejects undefined)
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map((v) => (typeof v === "object" ? sanitizeForFirestore(v) : v))
  if (typeof obj !== "object") return obj

  const out: any = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    if (v === null) {
      out[k] = null
      continue
    }
    if (typeof v === "object") {
      out[k] = sanitizeForFirestore(v)
    } else {
      out[k] = v
    }
  }
  return out
}

// --- Product utilities --------------------------------------------
export async function addProduct(productData: CreateProduct) {
  try {
    const payload = sanitizeForFirestore({
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    const docRef = await addDoc(collection(db, "products"), payload)
    return docRef.id
  } catch (error) {
    console.error("Error adding product:", error)
    throw error
  }
}

export async function getProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"))
    return querySnapshot.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
        updatedAt: data.updatedAt?.toDate?.() || data.updatedAt || null,
      }
    })
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

export async function getProduct(id: string) {
  try {
    const docRef = doc(db, "products", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
    return null
  } catch (error) {
    console.error("Error getting product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    const docRef = doc(db, "products", id)
    const payload = sanitizeForFirestore(productData)
    await updateDoc(docRef, payload)
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    await deleteDoc(doc(db, "products", id))
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

// --- Category utilities -------------------------------------------
export async function addCategory(categoryData: CreateCategory) {
  try {
    const payload = sanitizeForFirestore({
      ...categoryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    console.log('addCategory payload:', payload)
    const docRef = await addDoc(collection(db, "categories"), payload)
    console.log('addCategory docRef:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding category:", error)
    throw error
  }
}

export async function getCategories() {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"))
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error("Error getting categories:", error)
    throw error
  }
}

export async function updateCategory(id: string, categoryData: any) {
  try {
    const docRef = doc(db, "categories", id)
    const payload = sanitizeForFirestore(categoryData)
    await updateDoc(docRef, payload)
  } catch (error) {
    console.error("Error updating category:", error)
    throw error
  }
}

export async function deleteCategory(id: string) {
  try {
    await deleteDoc(doc(db, "categories", id))
  } catch (error) {
    console.error("Error deleting category:", error)
    throw error
  }
}

// --- SEO utilities -----------------------------------------------
export async function getSeoPages() {
  try {
    const querySnapshot = await getDocs(collection(db, "seo"))
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error("Error getting SEO pages:", error)
    throw error
  }
}

export async function createSeoPage(seoData: any) {
  try {
    const docRef = await addDoc(collection(db, "seo"), seoData)
    return docRef.id
  } catch (error) {
    console.error("Error creating SEO page:", error)
    throw error
  }
}

export async function updateSeoPage(id: string, seoData: any) {
  try {
    const docRef = doc(db, "seo", id)
    await updateDoc(docRef, seoData)
  } catch (error) {
    console.error("Error updating SEO page:", error)
    throw error
  }
}

// --- Image upload utility ----------------------------------------
export async function uploadImage(file: File, path: string) {
  try {
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    // return both download URL and storage path so callers can persist both
    return { url, path }
  } catch (error) {
    console.error("Error uploading image:", error)
    throw error
  }
}

export async function deleteImage(path: string) {
  try {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  } catch (error) {
    console.error("Error deleting image:", error)
    throw error
  }
}

// --- Order utilities ---------------------------------------------
export async function getOrdersWithFilters(filters: OrderFilters = {}): Promise<Order[]> {
  try {
    const ordersColl = collection(db, "orders")

    // Base query: newest first
    let baseQuery = query(ordersColl, orderBy("createdAt", "desc"))

    // If status filter is present, apply it in the Firestore query
    if (filters.status) {
      baseQuery = query(ordersColl, where("status", "==", filters.status), orderBy("createdAt", "desc"))
    }

    const querySnapshot = await getDocs(baseQuery)
    let orders = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order))

    // Apply remaining filters in memory (safe fallback when indexes are not configured)
    if (filters.startDate) {
      orders = orders.filter((o) => o.createdAt.toDate() >= filters.startDate!)
    }
    if (filters.endDate) {
      orders = orders.filter((o) => o.createdAt.toDate() <= filters.endDate!)
    }
    if (filters.minAmount !== undefined) {
      orders = orders.filter((o) => o.totalAmount >= filters.minAmount!)
    }
    if (filters.maxAmount !== undefined) {
      orders = orders.filter((o) => o.totalAmount <= filters.maxAmount!)
    }

    return orders
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw error
  }
}

export async function getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
  return getOrdersWithFilters({ startDate, endDate })
}

export async function getOrdersByStatus(status: Order['status']): Promise<Order[]> {
  return getOrdersWithFilters({ status })
}

export async function getOrdersByProduct(productId: string): Promise<Order[]> {
  return getOrdersWithFilters({ productId })
}

export async function getOrdersByAmountRange(minAmount: number, maxAmount: number): Promise<Order[]> {
  return getOrdersWithFilters({ minAmount, maxAmount })
}

export async function getOrders(): Promise<Order[]> {
  return getOrdersWithFilters()
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  try {
    const docRef = doc(db, "orders", orderId)
    await updateDoc(docRef, { status, updatedAt: Timestamp.now() })
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "orders", orderId))
  } catch (error) {
    console.error("Error deleting order:", error)
    throw error
  }
}

// --- Stock Management utilities ----------------------------------
export interface StockValidationResult {
  valid: boolean;
  insufficientItems: Array<{
    productId: string;
    title: string;
    requested: number;
    available: number;
  }>;
}

export async function validateOrderStock(orderId: string): Promise<StockValidationResult> {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId))
    if (!orderDoc.exists()) {
      throw new Error("Order not found")
    }

    const order = orderDoc.data() as Order
    const insufficientItems: StockValidationResult['insufficientItems'] = []

    for (const item of order.items) {
      // Get product ID from either 'id' or 'productId' field
      const productId = (item as any).id || (item as any).productId
      
      if (!productId) {
        console.warn("Order item missing product ID:", item)
        continue
      }

      const productDoc = await getDoc(doc(db, "products", productId))
      if (!productDoc.exists()) {
        insufficientItems.push({
          productId: productId,
          title: item.title,
          requested: item.quantity,
          available: 0,
        })
        continue
      }

      const product = productDoc.data() as Product
      
      // Check if stock is insufficient (including 0 stock)
      if (product.stock < item.quantity) {
        insufficientItems.push({
          productId: productId,
          title: item.title,
          requested: item.quantity,
          available: product.stock,
        })
      }
    }

    return {
      valid: insufficientItems.length === 0,
      insufficientItems,
    }
  } catch (error) {
    console.error("Error validating order stock:", error)
    throw error
  }
}

export async function deductOrderStock(orderId: string): Promise<void> {
  console.log(`🚀 Starting stock deduction for order: ${orderId}`)
  
  try {
    // Fetch the order
    const orderRef = doc(db, "orders", orderId)
    const orderDoc = await getDoc(orderRef)
    
    if (!orderDoc.exists()) {
      console.error(`❌ Order not found: ${orderId}`)
      throw new Error("Order not found")
    }

    const order = orderDoc.data() as Order
    
    // Validate order has items
    if (!order.items || !Array.isArray(order.items)) {
      console.error(`❌ Order has no items array:`, order)
      throw new Error("Order has no items")
    }

    if (order.items.length === 0) {
      console.warn(`⚠️ Order has empty items array`)
      return
    }

    console.log(`📋 Found ${order.items.length} items in order`)
    console.log(`📋 Items:`, JSON.stringify(order.items, null, 2))

    // Process each item
    let successCount = 0
    let skipCount = 0
    
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i]
      console.log(`\n🔄 Processing item ${i + 1}/${order.items.length}`)
      console.log(`   Item data:`, JSON.stringify(item, null, 2))
      
      // Get product ID from either 'id' or 'productId' field
      const productId = (item as any).id || (item as any).productId
      
      if (!productId) {
        console.warn(`⚠️ Item ${i + 1} missing product ID, skipping`)
        skipCount++
        continue
      }

      console.log(`   Product ID: ${productId}`)
      console.log(`   Quantity to deduct: ${item.quantity}`)

      // Fetch product
      const productRef = doc(db, "products", productId)
      const productDoc = await getDoc(productRef)
      
      if (!productDoc.exists()) {
        console.error(`❌ Product not found: ${item.productId}`)
        skipCount++
        continue
      }

      const product = productDoc.data() as Product
      console.log(`   Product found: ${product.title}`)
      console.log(`   Current stock: ${product.stock}`)
      
      // Calculate new stock
      const newStock = product.stock - item.quantity
      console.log(`   New stock will be: ${newStock}`)

      // Update stock in Firestore
      console.log(`   💾 Updating Firestore...`)
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: Timestamp.now(),
      })
      
      console.log(`   ✅ Successfully updated stock for ${product.title}`)
      successCount++
    }
    
    console.log(`\n✅ Stock deduction complete!`)
    console.log(`   Success: ${successCount} items`)
    console.log(`   Skipped: ${skipCount} items`)
    
  } catch (error) {
    console.error("❌ Error in deductOrderStock:", error)
    throw error
  }
}

export async function updateOrderStatusWithStockManagement(
  orderId: string,
  newStatus: Order['status'],
  currentStatus: Order['status']
): Promise<{ success: boolean; error?: string; stockIssues?: StockValidationResult['insufficientItems'] }> {
  try {
    console.log(`🔄 Status Change Request: ${currentStatus} → ${newStatus} for order ${orderId}`)
    
    // If moving from pending to processing, validate and deduct stock
    if (currentStatus === 'pending' && newStatus === 'processing') {
      console.log('✅ Condition met: pending → processing, starting stock validation...')
      
      const validation = await validateOrderStock(orderId)
      console.log('📊 Stock validation result:', validation)
      
      if (!validation.valid) {
        console.log('❌ Stock validation failed:', validation.insufficientItems)
        return {
          success: false,
          error: 'Insufficient stock',
          stockIssues: validation.insufficientItems,
        }
      }

      console.log('✅ Stock validation passed, deducting stock...')
      // Deduct stock
      await deductOrderStock(orderId)
      console.log('✅ Stock deduction completed')
    } else {
      console.log(`ℹ️ No stock deduction needed for ${currentStatus} → ${newStatus}`)
    }

    // Update order status
    console.log('📝 Updating order status in database...')
    await updateOrderStatus(orderId, newStatus)
    console.log('✅ Order status updated successfully')
    
    return { success: true }
  } catch (error) {
    console.error("❌ Error updating order status with stock management:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function addOrder(orderData: CreateOrder): Promise<string> {
  try {
    // Ensure each order item contains a productSnapshot so order views keep historical product data
    const itemsWithSnapshots = await Promise.all(
      (orderData.items || []).map(async (item: any) => {
        if (item.productSnapshot) return item
        try {
          const prod: any = await getProduct(item.productId)
          const snapshot = prod
            ? {
                title: prod.title,
                price: prod.price,
                imageUrl: prod.imageUrl,
                imagePath: prod.imagePath,
                sku: prod.sku,
                weight: prod.weight,
                dimensions: prod.dimensions,
                material: prod.material,
                color: prod.color,
              }
            : undefined
          return { ...item, productSnapshot: snapshot }
        } catch (e) {
          console.warn('Could not fetch product for snapshot', item.productId, e)
          return item
        }
      })
    )

    const payload = sanitizeForFirestore({
      ...orderData,
      items: itemsWithSnapshots,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    const docRef = await addDoc(collection(db, "orders"), payload)
    return docRef.id
  } catch (error) {
    console.error("Error adding order:", error)
    throw error
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// --- Blog utilities -----------------------------------------------
export async function addBlog(blogData: CreateBlog) {
  try {
    const payload = sanitizeForFirestore({
      ...blogData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
    const docRef = await addDoc(collection(db, "blogs"), payload)
    console.log('addBlog docRef:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error adding blog:", error)
    throw error
  }
}

export async function getBlogs() {
  try {
    const querySnapshot = await getDocs(collection(db, "blogs"))
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error("Error getting blogs:", error)
    throw error
  }
}

export async function getBlog(id: string) {
  try {
    const docRef = doc(db, "blogs", id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() }
    return null
  } catch (error) {
    console.error("Error getting blog:", error)
    throw error
  }
}

export async function updateBlog(id: string, blogData: any) {
  try {
    const docRef = doc(db, "blogs", id)
    const payload = sanitizeForFirestore(blogData)
    await updateDoc(docRef, payload)
  } catch (error) {
    console.error("Error updating blog:", error)
    throw error
  }
}

export async function deleteBlog(id: string) {
  try {
    await deleteDoc(doc(db, "blogs", id))
  } catch (error) {
    console.error("Error deleting blog:", error)
    throw error
  }
}
