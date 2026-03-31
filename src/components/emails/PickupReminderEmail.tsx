import {
  Html, Head, Body, Container, Text, Heading, Button, Hr,
} from '@react-email/components'
import { formatDateTime } from '@/lib/utils'

interface Props {
  name: string
  orderId: string
  pickupLabel: string
  pickupTime: string
}

export function PickupReminderEmail({ name, orderId, pickupLabel, pickupTime }: Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tanias-wholesale.vercel.app'
  const shortId = orderId.slice(0, 8).toUpperCase()

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#111827', fontSize: 22 }}>
            Your order is ready for pickup tomorrow!
          </Heading>
          <Text style={{ color: '#374151', fontSize: 16 }}>Hi {name},</Text>
          <Text style={{ color: '#374151', fontSize: 16 }}>
            A friendly reminder that your order <strong>#{shortId}</strong> is scheduled for pickup:
          </Text>
          <Text style={{ backgroundColor: '#fef9c3', padding: '12px 16px', borderRadius: 6, fontSize: 16, fontWeight: 600 }}>
            {pickupLabel} — {formatDateTime(pickupTime)}
          </Text>
          <Text style={{ color: '#374151', fontSize: 14 }}>
            We&apos;ll have everything prepped and ready. Just head to the counter and mention your order number.
          </Text>
          <Button
            href={`${appUrl}/member/orders`}
            style={{ backgroundColor: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: 6, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}
          >
            View order details →
          </Button>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            Tania&apos;s Wholesale Club · See you soon!
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PickupReminderEmail
