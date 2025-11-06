"use client"

export default function QuickLinks() {
  const links = [
    {
      title: "MLS",
      icon: "📊",
      description: "Multiple Listing Service",
    },
    {
      title: "Member Portal",
      icon: "🔒",
      description: "Access member resources",
    },
    {
      title: "Market Insights",
      icon: "📈",
      description: "Market data and trends",
    },
    {
      title: "Continuing Ed",
      icon: "📚",
      description: "Professional development",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-12 text-center">Quick Links</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link) => (
            <div
              key={link.title}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-5xl">
                {link.icon}
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-lg text-primary mb-2">{link.title}</h3>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
