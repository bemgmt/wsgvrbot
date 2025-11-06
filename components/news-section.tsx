"use client"

export default function NewsSection() {
  const news = [
    {
      title: "Market Snapshot: Fall 2025",
      date: "November 2025",
      category: "Market Data",
    },
    {
      title: "New Member Orientation",
      date: "December 2025",
      category: "Events",
    },
    {
      title: "Ethics & Professional Standards Update",
      date: "January 2026",
      category: "Training",
    },
  ]

  return (
    <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-12 text-center">Recent News & Events</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {news.map((item) => (
            <div
              key={item.title}
              className="bg-card p-6 rounded-lg border border-border hover:border-secondary transition-colors"
            >
              <span className="inline-block bg-secondary/20 text-secondary text-xs font-bold px-3 py-1 rounded mb-3">
                {item.category}
              </span>
              <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.date}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
