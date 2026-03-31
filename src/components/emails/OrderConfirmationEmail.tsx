import {
  Html, Head, Body, Container, Section, Text, Heading, Hr, Row, Column,
} from '@react-email/components'
import { formatCurrency } from '@/lib/utils'

interface OrderItem {
  name: string
  quantity: number
  lineTotal: number
}

interface Props {
  name: string
  orderId: string
  items: OrderItem[]
  subtotal: number
  discountAmt: number
  total: number
}

export function OrderConfirmationEmail({ name, orderId, items, subtotal, discountAmt, total }: Props) {
  const shortId = orderId.slice(0, 8).toUpperCase()
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#111827', fontSize: 22 }}>
            Order Confirmed — #{shortId}
          </Heading>
          <Text style={{ color: '#374151', fontSize: 16 }}>Hi {name}, your order has been received and is being processed.</Text>

          <Section style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '0 16px', margin: '24px 0' }}>
            {items.map((item) => (
              <Row key={item.name} style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 0' }}>
                <Column style={{ width: '70%' }}>
                  <Text style={{ color: '#111827', fontSize: 14, margin: 0 }}>{item.name}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, margin: '2px 0 0' }}>Qty: {item.quantity}</Text>
                </Column>
                <Column style={{ textAlign: 'right' }}>
                  <Text style={{ color: '#111827', fontSize: 14, fontWeight: 600, margin: 0 }}>
                    {formatCurrency(item.lineTotal)}
                  </Text>
                </Column>
              </Row>
            ))}

            <Row style={{ padding: '8px 0' }}>
              <Column style={{ width: '70%' }}><Text style={{ color: '#6b7280', fontSize: 13, margin: 0 }}>Subtotal</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ fontSize: 13, margin: 0 }}>{formatCurrency(subtotal)}</Text></Column>
            </Row>
            {discountAmt > 0 && (
              <Row style={{ padding: '4px 0' }}>
                <Column style={{ width: '70%' }}><Text style={{ color: '#16a34a', fontSize: 13, margin: 0 }}>Member discount</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text style={{ color: '#16a34a', fontSize: 13, margin: 0 }}>−{formatCurrency(discountAmt)}</Text></Column>
              </Row>
            )}
            <Row style={{ borderTop: '2px solid #111827', padding: '10px 0' }}>
              <Column style={{ width: '70%' }}><Text style={{ color: '#111827', fontSize: 15, fontWeight: 700, margin: 0 }}>Total</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ color: '#111827', fontSize: 15, fontWeight: 700, margin: 0 }}>{formatCurrency(total)}</Text></Column>
            </Row>
          </Section>

          <Text style={{ color: '#374151', fontSize: 14 }}>
            You&apos;ll receive another email when your order is ready for pickup.
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            Tania&apos;s Wholesale Club · Reply to this email with any questions.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail
