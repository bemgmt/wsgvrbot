// Product data with pricing for public and agent versions
export interface Product {
  id: string
  name: string
  description: string
  image: string
  price: number
  agentPrice: number
  features: string[]
  specs: string
}

export const products: Product[] = [
  {
    id: "vk-240",
    name: "VK-240-25-3000 Intelligent Fire Sprinkler",
    description: "AI-enhanced precision fire-suppression system for residential and commercial use",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WechatIMG413-1NbuHEISX3ViaiAMFKZoYtvleeg2AX.png",
    price: 4299,
    agentPrice: 3439.2, // 20% discount
    features: [
      "AI-driven real-time threat detection",
      "Precision water release - minimizes damage",
      "12 L/s high flow rate suppression",
      "Automatic activation on threat detection",
      "UL & FCC Certified",
      "Professional installation included",
    ],
    specs: "Flow Rate: 12 L/s | Max Head Pressure: 110 m | Power: 3 kW | Voltage: 220V | AI Detection: Real-time",
  },
  {
    id: "backup-battery",
    name: "Backup Home Battery System",
    description: "Power continuity for safety systems and essential equipment during outages",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%AA%E5%B1%8F2025-06-13-18.16.37-Qoo2vaGfIkOj8ODsDYcAVekpBlXeeu.png",
    price: 5999,
    agentPrice: 4799.2, // 20% discount
    features: [
      "Keeps fire systems operational during outages",
      "Powers essential home equipment",
      "Long-duration backup capacity",
      "Seamless integration with VICON",
      "UPS-grade reliability",
      "10-year warranty",
    ],
    specs: "Capacity: 13.5 kWh | Continuous power support | UPS-grade reliability | Silent operation",
  },
]
