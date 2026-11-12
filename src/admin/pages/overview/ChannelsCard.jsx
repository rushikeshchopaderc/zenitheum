import { Card } from "../../components/Cards";
import { EmptyState } from "../../components/Feedback";
import RankedBars from "../../charts/RankedBars";
import { fmtPct, plural } from "../../format";
import { channelLabel } from "../../labels";

/** Sessions by marketing channel, with each channel's conversion (leads / sessions) under its bar. */
export default function ChannelsCard({ channels }) {
  const items = channels.map((channel) => ({
    key: channel.channel,
    label: channelLabel(channel.channel),
    value: channel.sessions,
    sub: `${plural(channel.leads, "lead")} · ${plural(channel.applications, "application")} · ${fmtPct(channel.sessions ? channel.leads / channel.sessions : 0, 1)} lead conversion`,
  }));
  return (
    <Card title="Traffic by channel" subtitle="Where visits came from. Conversion is leads divided by visits from that channel.">
      {items.length ? (
        <RankedBars items={items} unit="sessions" share label="Sessions by channel" />
      ) : (
        <EmptyState compact icon="campaigns" title="No visits to break down">
          Channels fill in as visits arrive. Tag your links with the builder under Campaigns to see which post or newsletter brought people.
        </EmptyState>
      )}
    </Card>
  );
}
