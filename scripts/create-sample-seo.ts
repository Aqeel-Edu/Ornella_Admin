import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyALwOC0Bk2xUfoTJpGTi-8knQArE1GPdo8",
  authDomain: "ornella-f303f.firebaseapp.com",
  projectId: "ornella-f303f",
  storageBucket: "ornella-f303f.firebasestorage.app",
  messagingSenderId: "659357488733",
  appId: "1:659357488733:web:14daadb13897de75289fb4",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createSampleSeoPage() {
  try {
    const sampleSeoData = {
      page: "home",
      slug: "/",
      metaTitle: "Ornella - Premium Home Décor & Art for Pakistani Homes",
      metaDescription:
        "Transform your living space with Ornella's curated collection of premium home décor, wall art, and furniture. Discover elegant designs perfect for modern Pakistani homes with fast delivery across Pakistan.",
      keywords: [
        "home decor Pakistan",
        "wall art online",
        "modern furniture",
        "interior design",
        "home accessories",
        "premium decor",
        "Pakistani home styling",
        "living room decor",
        "bedroom furniture",
        "decorative items",
      ],
      h2: "Discover Premium Home Décor Collections",
      h3: "Curated Designs for Every Room in Your Home",
    }

    const docRef = await addDoc(collection(db, "seo"), sampleSeoData)
    console.log("✅ Sample SEO page created successfully!")
    console.log("Document ID:", docRef.id)
    console.log("\nSample Data:")
    console.log(JSON.stringify(sampleSeoData, null, 2))
    console.log("\nYou can now view and edit this in the SEO Manager at /admin/seo")
  } catch (error) {
    console.error("❌ Error creating sample SEO page:", error)
  }
}

createSampleSeoPage()
