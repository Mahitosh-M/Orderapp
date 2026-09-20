import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { defineString } from 'firebase-functions/params';
import { GoogleAuth } from 'google-auth-library';

const destination = defineString('CIS_ORDER_NOTIFICATION_URL');
const auth = new GoogleAuth();

// Event delivery is trusted; no browser can invoke the receiving IAM-private CISapp endpoint.
// Existing order writes and order calculations are unchanged, including when this relay fails.
export const relayCustomerOrderNotification = onDocumentCreated({
  serviceAccount: 'notification-relay@orderapp-35200.iam.gserviceaccount.com',
  document: 'orders/{orderId}', region: 'asia-south1', minInstances: 0, maxInstances: 2,
  memory: '256MiB', cpu: 'gcf_gen1', concurrency: 1, timeoutSeconds: 60, retry: true
}, async event => {
  if (Date.now() - Date.parse(event.time) > 15 * 60 * 1000) return;
  const order = event.data?.data();
  if (!order || order.status !== 'pending' || !Array.isArray(order.items) || order.items.length === 0) return;
  if (typeof order.customerId !== 'string' || !order.customerId || order.customerId.length > 160 || [...order.customerId].some(character => character === '/' || character.charCodeAt(0) < 32)) return;
  const url = new URL(destination.value());
  if (url.protocol !== 'https:' || !/^([a-z0-9-]+\.)?(cloudfunctions\.net|run\.app)$/.test(url.hostname)) throw new Error('Invalid CIS notification endpoint configuration.');
  try {
    const client = await auth.getIdTokenClient(url.href);
    await client.request({ url: url.href, method: 'POST', timeout: 45000,
    data: { orderId: event.params.orderId, customerId: order.customerId }
  }); } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status && status >= 400 && status < 500 && status !== 429) {
      logger.warn('Order notification configuration rejected the relay.', { status });
      return; // Permanent access/configuration failures must not create a retry storm.
    }
    // Avoid logging Google client errors, which can contain authorization headers.
    // eslint-disable-next-line preserve-caught-error
    throw new Error('Order notification relay temporarily unavailable.');
  }
});
