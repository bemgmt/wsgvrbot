import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface LeadData {
  name: string
  email: string
  phone: string
}

export async function POST(request: Request) {
  try {
    const { name, email, phone }: LeadData = await request.json()

    if (!name || !email || !phone) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Send email to VICON team
    await resend.emails.send({
      from: "VICON Bot <onboarding@resend.dev>",
      to: "info@vicontech.group",
      subject: `New Lead from VICON Chatbot: ${name}`,
      html: `
        <h2>New Lead Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><em>This lead came from the VICON website chatbot.</em></p>
      `,
    })

    // Send confirmation to user
    await resend.emails.send({
      from: "VICON <onboarding@resend.dev>",
      to: email,
      subject: "Thank you for your interest in VICON!",
      html: `
        <h2>Thank you, ${name}!</h2>
        <p>We've received your inquiry and our team will be reaching out to you shortly at ${phone} to discuss your fire protection needs.</p>
        <p>In the meantime, feel free to visit <a href="https://vicontech.group">our website</a> to learn more about VICON's intelligent fire protection systems.</p>
        <p>Best regards,<br/>The VICON Team</p>
      `,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Lead escalation error:", error)
    return Response.json({ error: "Failed to process lead" }, { status: 500 })
  }
}
