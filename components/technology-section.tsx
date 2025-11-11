export default function TechnologySection({ id }: { id?: string }) {
  return (
    <section id={id} className="py-20 bg-primary text-primary-foreground px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">The Science of Instant Response</h2>
        <div className="w-24 h-1 bg-accent mx-auto mb-8" />

        <p className="text-lg mb-8 leading-relaxed">
          VICON integrates AI vision, IoT sensors, and high-pressure mechanics into one seamless safety system.
        </p>

        <p className="text-xl text-primary-foreground/90 leading-relaxed">
          It doesn't wait for alarms — it takes action in seconds, saving lives and reducing damage before emergency
          crews arrive.
        </p>
      </div>
    </section>
  )
}
