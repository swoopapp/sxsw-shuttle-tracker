export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const botToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!botToken || !channel) return res.status(500).json({ error: 'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not configured' });

  const { event_type, data } = req.body || {};
  if (!event_type) return res.status(400).json({ error: 'Missing event_type' });

  const message = formatSlackMessage(event_type, data || {});
  const isNewRequest = event_type === 'ada_new_request';
  const threadTs = data?.slack_thread_ts || null;

  const payload = {
    channel,
    text: message.text,
    blocks: message.blocks,
  };

  // Thread follow-up events under the original message
  if (!isNewRequest && threadTs) {
    payload.thread_ts = threadTs;
  }

  try {
    const resp = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botToken}`,
      },
      body: JSON.stringify(payload),
    });
    const result = await resp.json();
    if (!result.ok) return res.status(502).json({ error: result.error });

    // Return the ts so the client can save it for threading
    return res.status(200).json({ ok: true, ts: result.ts });
  } catch (err) {
    return res.status(502).json({ error: 'Failed to reach Slack' });
  }
}

function formatSlackMessage(event_type, data) {
  const blocks = [];
  const ts = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' });

  switch (event_type) {

    // ── ADA Request Events ──

    case 'ada_new_request':
      blocks.push(
        section(`*New ADA Request* :wheelchair:\n*${data.passenger_name}* requested a ride`),
        section(
          `*Pickup:* ${data.pickup_location}\n` +
          `*Drop-off:* ${data.dropoff_location}\n` +
          `*Time:* ${data.pickup_time || 'ASAP'}\n` +
          (data.notes ? `*Notes:* ${data.notes}` : '')
        ),
        context(`Submitted at ${ts} CT`)
      );
      return { blocks, text: `New ADA request from ${data.passenger_name}` };

    case 'ada_claimed':
      blocks.push(
        section(`*Trip Claimed* :blue_car:\n*Shuttle ${data.shuttle_num}* claimed the trip for *${data.passenger_name}*`),
        context(`Claimed at ${ts} CT`)
      );
      return { blocks, text: `Shuttle ${data.shuttle_num} claimed trip for ${data.passenger_name}` };

    case 'ada_picked_up':
      blocks.push(
        section(`*Passenger Picked Up* :busstop:\n*Shuttle ${data.shuttle_num}* picked up *${data.passenger_name}*`),
        context(`Picked up at ${ts} CT`)
      );
      return { blocks, text: `Shuttle ${data.shuttle_num} picked up ${data.passenger_name}` };

    case 'ada_dropped_off':
      blocks.push(
        section(`*Trip Complete* :white_check_mark:\n*Shuttle ${data.shuttle_num}* dropped off *${data.passenger_name}* at *${data.dropoff_location}*`),
        context(`Completed at ${ts} CT`)
      );
      return { blocks, text: `Shuttle ${data.shuttle_num} dropped off ${data.passenger_name}` };

    case 'ada_cancelled':
      blocks.push(
        section(`*Request Cancelled* :x:\nTrip for *${data.passenger_name}* was cancelled`),
        context(`Cancelled at ${ts} CT`)
      );
      return { blocks, text: `ADA request for ${data.passenger_name} cancelled` };

    // ── Driver Events ──

    case 'driver_online':
      blocks.push(
        section(`*Driver Online* :green_circle:\n*Shuttle ${data.shuttle_num}* driver is now active` +
          (data.shuttle_type === 'ada' ? ' (ADA)' : '')),
        context(`Online at ${ts} CT`)
      );
      return { blocks, text: `Shuttle ${data.shuttle_num} driver came online` };

    case 'driver_offline':
      blocks.push(
        section(`*Driver Offline* :red_circle:\n*Shuttle ${data.shuttle_num}* driver went offline` +
          (data.shuttle_type === 'ada' ? ' (ADA)' : '')),
        context(`Offline at ${ts} CT`)
      );
      return { blocks, text: `Shuttle ${data.shuttle_num} driver went offline` };

    default:
      return { text: `[${event_type}] ${JSON.stringify(data)}` };
  }
}

function section(text) {
  return { type: 'section', text: { type: 'mrkdwn', text } };
}

function context(text) {
  return { type: 'context', elements: [{ type: 'mrkdwn', text }] };
}
