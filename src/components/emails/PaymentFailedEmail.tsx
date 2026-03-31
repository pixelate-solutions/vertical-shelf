import {
  Html, Head, Body, Container, Text, Heading, Button, Hr,
} from '@react-email/components'

interface Props {
  name: string
}

export function PaymentFailedEmail({ name }: Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tanias-wholesale.vercel.app'

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#dc2626', fontSize: 22 }}>
            Payment failed — action required
          </Heading>
          <Text style={{ color: '#374151', fontSize: 16 }}>Hi {name},</Text>
          <Text style={{ color: '#374151', fontSize: 16 }}>
            We weren&apos;t able to process your membership payment. Your access will remain active
            for a short grace period, but please update your payment method to avoid any interruption.
          </Text>
          <Button
            href={`${appUrl}/member/account`}
            style={{ backgroundColor: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: 6, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}
          >
            Update payment method →
          </Button>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            Tania&apos;s Wholesale Club · Reply to this email if you have questions.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PaymentFailedEmail
