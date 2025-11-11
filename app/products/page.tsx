import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { products } from "@/lib/products"

export const metadata = {
  title: "VICON Products - Fire Protection Systems",
  description: "Browse VICON intelligent fire protection systems and backup battery solutions",
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">VICON Products</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional fire protection systems engineered for Southern California homes and businesses. All products
              include professional installation and comprehensive support.
            </p>
            <div className="w-24 h-1 bg-accent mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} price={product.price} />
            ))}
          </div>

          <div className="bg-primary text-primary-foreground p-12 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Need Help Choosing?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Schedule a free consultation with our VICON experts to determine the perfect fire protection system for
              your property.
            </p>
            <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-3 rounded-lg font-bold transition-colors">
              Schedule Free Consultation
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
