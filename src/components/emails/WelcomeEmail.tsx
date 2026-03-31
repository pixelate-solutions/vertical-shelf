import {
  Html, Head, Body, Container, Section, Text, Heading, Button, Hr,
} from '@react-email/components'
import type { MembershipTier } from '@/types/membership'
import { getTierConfig } from '@/types/membership'

interface Props {
  name: string
  tier: MembershipTier
}

export function WelcomeEmail({ name, tier }: Props) {
  const config = getTierConfig(tier)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tanias-wholesale.vercel.app'

  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
        <Container style={{ maxWidth: 560, margin: '40px auto', backgroundColor: '#fff', borderRadius: 8, padding: 32 }}>
          <Heading style={{ color: '#111827', fontSize: 24, marginBottom: 8 }}>
            Welcome to Tania&apos;s Wholesale Club!
          </Heading>
          <Text style={{ color: '#374151', fontSize: 16 }}>
            Hi {name},
          </Text>
          <Text style={{ color: '#374151', fontSize: 16 }}>
            You&apos;re now a <strong>{config.label}</strong> member. Here&apos;s what that means for you:
          </Text>
          <Section style={{ backgroundColor: '#f3f4f6', borderRadius: 6, padding: '16px 20px', margin: '20px 0' }}>
            {config.features.map((f) => (
              <Text key={f} style={{ color: '#111827', fontSize: 14, margin: '4px 0' }}>
                ✓ {f}
              </Text>
            ))}
          </Section>
          <Button
            href={`${appUrl}/member/dashboard`}
            style={{ backgroundColor: '#ef4444', color: '#fff', padding: '12px 24px', borderRadius: 6, fontSize: 15, textDecoration: 'none', display: 'inline-block' }}
          >
            Go to your member dashboard →
          </Button>
          <Hr style={{ margin: '32px 0', borderColor: '#e5e7eb' }} />
          <Text style={{ color: '#9ca3af', fontSize: 13 }}>
            Questions? Reply to this email or visit your account page to manage your membership.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail
