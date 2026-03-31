import {
  Html, Head, Body, Container, Text, Heading, Section, Hr,
} from '@react-email/components'

interface Props {
  itemName: string
  stockQty: number
  supplierName: string
  supplierContact: string
  supplierSku: string
}

export function ReorderAlertEmail({ itemName, stockQty, supplierName, supplierContact, supplierSku }: Props) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tanias-wholesale.vercel.app'

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#d97706', fontSize: 22 }}>
            Low stock alert: {itemName}
          </Heading>
          <Text style={{ color: '#374151', fontSize: 16 }}>
            <strong>{itemName}</strong> has fallen to <strong>{stockQty} units</strong> — below the reorder threshold.
          </Text>

          <Section style={{ backgroundColor: '#fef3c7', borderRadius: 6, padding: '16px 20px', margin: '20px 0' }}>
            <Text style={{ color: '#92400e', fontSize: 14, margin: '4px 0' }}><strong>Supplier:</strong> {supplierName}</Text>
            <Text style={{ color: '#92400e', fontSize: 14, margin: '4px 0' }}><strong>Contact:</strong> {supplierContact}</Text>
            <Text style={{ color: '#92400e', fontSize: 14, margin: '4px 0' }}><strong>Supplier SKU:</strong> {supplierSku}</Text>
          </Section>

          <Text style={{ color: '#374151', fontSize: 14 }}>
            <a href={`${appUrl}/owner/inventory`} style={{ color: '#ef4444' }}>View inventory dashboard →</a>
          </Text>
          <Hr style={{ margin: '24px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
            Tania&apos;s Wholesale Club — Owner Alert
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ReorderAlertEmail
