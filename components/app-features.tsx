import { Smartphone, Bell, Zap, FileText } from "lucide-react"

export default function AppFeatures({ id }: { id?: string }) {
  const features = [
    {
      icon: Smartphone,
      title: "Live Camera View",
      description: "Watch your property in real-time from anywhere in the world.",
    },
    {
      icon: Bell,
      title: "Instant Alerts",
      description: "Receive notifications the moment a threat is detected with live video verification.",
    },
    {
      icon: Zap,
      title: "Manual Override & Remote Control",
      description: "Take manual control of your system anytime, even during automatic suppression.",
    },
    {
      icon: FileText,
      title: "Cloud-Based Logs",
      description: "Access historical records for insurance claims and system optimization.",
    },
  ]

  return (
    <section id={id} className="py-20 bg-background px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Control, Monitor, and Stay Informed</h2>
          <p className="text-lg text-muted-foreground mb-8">Stay connected with your home's safety in real time:</p>
          <div className="w-24 h-1 bg-accent mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="flex gap-6 p-8 bg-primary/5 border border-primary/20 rounded-lg hover:border-accent/50 transition-colors"
              >
                <Icon className="text-accent flex-shrink-0" size={40} />
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
