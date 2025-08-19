import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import crypto from 'crypto';

// Verify webhook signature from ReachInbox (if they provide one)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const data = JSON.parse(body);

    // Optional: Verify webhook signature if ReachInbox provides one
    const signature = request.headers.get('x-reachinbox-signature');
    const webhookSecret = process.env.REACHINBOX_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Handle different event types from ReachInbox
    const { event, email, metadata } = data;

    // Extract claim token from metadata or email content
    // This assumes you'll include the token in the email tracking or as metadata
    const claimToken = metadata?.claim_token || 
                      metadata?.custom_data?.claim_token ||
                      extractTokenFromEmail(email);

    if (!claimToken) {
      console.log('No claim token found in webhook data:', data);
      return NextResponse.json({ 
        success: true, 
        message: 'No token to track' 
      });
    }

    // Update campaign based on event type
    switch (event) {
      case 'email.sent':
      case 'sent':
        await sql`
          UPDATE claim_campaigns 
          SET email_sent_at = COALESCE(email_sent_at, NOW()),
              email_sent_to = COALESCE(email_sent_to, ${email}),
              updated_at = NOW()
          WHERE claim_token = ${claimToken}
        `;
        break;

      case 'email.opened':
      case 'open':
      case 'opened':
        await sql`
          UPDATE claim_campaigns 
          SET email_opened_at = COALESCE(email_opened_at, NOW()),
              updated_at = NOW()
          WHERE claim_token = ${claimToken}
        `;
        break;

      case 'email.clicked':
      case 'click':
      case 'clicked':
        await sql`
          UPDATE claim_campaigns 
          SET link_clicked_at = COALESCE(link_clicked_at, NOW()),
              updated_at = NOW()
          WHERE claim_token = ${claimToken}
        `;
        break;

      case 'email.bounced':
      case 'bounce':
      case 'bounced':
        // Track bounced emails for cleanup
        await sql`
          UPDATE claim_campaigns 
          SET email_bounced_at = NOW(),
              updated_at = NOW()
          WHERE claim_token = ${claimToken}
        `;
        break;

      case 'email.unsubscribed':
      case 'unsubscribe':
        // Track unsubscribes
        await sql`
          UPDATE claim_campaigns 
          SET email_unsubscribed_at = NOW(),
              updated_at = NOW()
          WHERE claim_token = ${claimToken}
        `;
        break;

      default:
        console.log('Unknown webhook event:', event);
    }

    // Log webhook event for debugging
    console.log(`ReachInbox webhook processed: ${event} for token: ${claimToken}`);

    return NextResponse.json({ 
      success: true,
      event,
      token: claimToken
    });

  } catch (error) {
    console.error('ReachInbox webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to extract token from email URL if included in the webhook
function extractTokenFromEmail(email: string): string | null {
  if (!email) return null;
  
  // Look for claim URL pattern in the email
  const match = email.match(/\/claim\/([a-z0-9]{8})/i);
  return match ? match[1] : null;
}