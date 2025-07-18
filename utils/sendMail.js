const MAIL_API_URL = process.env.MAIL_API_URL
const MAIL_API_KEY = "VIVEKBADBOY!@#$%^&*()1234567890"

export async function sendMail(type, data) {
  try {
    const response = await fetch(MAIL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': MAIL_API_KEY,
      },
      body: JSON.stringify({ ...data, type, apiKey: MAIL_API_KEY }),
    })

    const result = await response.json()
    if (result.status !== 'success') {
        console.log(result.message);
        throw new Error('Mail send failed')
    }
    return true
  } catch (err) {
    console.error('Mailer error:', err)
    return false
  }
}
