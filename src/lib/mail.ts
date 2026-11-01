export async function sendMail(to: string, subject: string, text: string) {
  const from = process.env.MAIL_FROM || 'Shaheen Law Associates <notices@shaheenlaw.pk>'
  const key = process.env.RESEND_API_KEY
  if (key) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, text }),
    })
    if (!response.ok) {
      throw new Error('Email could not be sent')
    }
    return { delivered: true as const }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[mail] To ${to}\n${subject}\n${text}`)
  }
  return { delivered: false as const }
}
