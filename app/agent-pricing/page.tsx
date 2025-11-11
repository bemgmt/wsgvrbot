import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import ProductCard from "@/components/product-card"
import { products } from "@/lib/products"

export const metadata = {
  title: "VICON Agent Pricing",
  description: "Exclusive agent pricing for VICON fire protection systems",
}

export default function AgentPricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Agent Pricing</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exclusive pricing for authorized VICON agents. Save 20% on all products with professional installation and
              comprehensive support included.
            </p>
            <div className="w-24 h-1 bg-accent mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} price={product.agentPrice} isAgent={true} />
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 p-8 rounded-lg mb-12">
            <h2 className="text-2xl font-bold text-green-900 mb-4">Agent Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "20% Discount",
                  description: "Save on all VICON products with agent pricing",
                },
                {
                  title: "Priority Support",
                  description: "Dedicated support team for agent inquiries and issues",
                },
                {
                  title: "Marketing Materials",
                  description: "Access to exclusive promotional materials and branding",
                },
              ].map((benefit, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-green-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-green-800">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary text-primary-foreground p-12 rounded-lg text-center">
            <h2 className="text-3xl font-bold mb-4">Questions?</h2>
            <p className="text-lg mb-8">
              Contact our agent support team for more information about bulk orders, commissions, and partnership
              opportunities.
            </p>
            <button className="bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-3 rounded-lg font-bold transition-colors">
              Contact Agent Support
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
