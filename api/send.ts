import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, name, email, message } = req.body;

  // Validate required fields
  if (!message || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let subject: string;
    let html: string;

    if (type === 'letter') {
      // From personal page "Write a Letter" modal
      subject = `📬 New Letter from your Portfolio`;
      html = `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; border: 3px solid #222; padding: 2rem; background: #f9f8f4;">
          <h2 style="font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #222; padding-bottom: 1rem; margin-bottom: 2rem;">
            // New Letter
          </h2>
          <p style="font-size: 0.9rem; color: #444; line-height: 1.8; white-space: pre-wrap;">${message}</p>
          <p style="margin-top: 2rem; font-size: 0.8rem; color: #888; border-top: 1px solid #ccc; padding-top: 1rem;">
            Sent anonymously via your portfolio personal page.
          </p>
        </div>
      `;
    } else {
      // From contact page form
      subject = `📨 Portfolio Contact: ${name}`;
      html = `
        <div style="font-family: 'Courier New', monospace; max-width: 600px; margin: 0 auto; border: 3px solid #222; padding: 2rem; background: #f9f8f4;">
          <h2 style="font-size: 1.2rem; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #222; padding-bottom: 1rem; margin-bottom: 2rem;">
            // New Contact Message
          </h2>
          <p style="margin-bottom: 0.5rem;"><strong>From:</strong> ${name}</p>
          <p style="margin-bottom: 2rem;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #222;">${email}</a></p>
          <p style="font-size: 0.9rem; color: #444; line-height: 1.8; border-left: 3px solid #222; padding-left: 1rem; white-space: pre-wrap;">${message}</p>
          <p style="margin-top: 2rem; font-size: 0.8rem; color: #888; border-top: 1px solid #ccc; padding-top: 1rem;">
            Sent via your portfolio contact page.
          </p>
        </div>
      `;
    }

    await resend.emails.send({
      from: 'Portfolio <contact@rushsh.dev>', // Change to your verified domain later
      to: 'rushabh1404@gmail.com',
      subject,
      html,
      // For contact form, allow replying directly to sender
      ...(type === 'contact' && email ? { replyTo: email } : {}),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}