import type { Product } from "@/lib/products"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
  price: number
  isAgent?: boolean
}

export default function ProductCard({ product, price, isAgent = false }: ProductCardProps) {
  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <div className="relative overflow-hidden bg-muted h-64">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {isAgent && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Agent Pricing
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{product.name}</h3>
        <p className="text-muted-foreground text-sm mb-4">{product.description}</p>

        <ul className="space-y-2 mb-6">
          {product.features.slice(0, 3).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
              <span className="text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="bg-muted p-3 rounded mb-6">
          <p className="text-xs text-muted-foreground mb-1">Specifications</p>
          <p className="text-xs text-foreground">{product.specs}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Price</p>
            <p className="text-3xl font-bold text-primary">${(price / 100).toFixed(2)}</p>
          </div>
          {isAgent && product.agentPrice < product.price && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground line-through">${(product.price / 100).toFixed(2)}</p>
              <p className="text-sm font-semibold text-green-600">Save 20%</p>
            </div>
          )}
        </div>

        <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
          <ShoppingCart size={20} />
          Add to Cart
        </button>
      </div>
    </div>
  )
}
