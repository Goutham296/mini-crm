import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DEAL_STAGES, stageLabel } from '../../lib/constants';
import { formatMoney, formatMoneyCompact } from '../../lib/format';
import type { Dashboard, DealStage } from '../../lib/types';

const BAR_COLOR: Record<DealStage, string> = {
  lead: '#a5a8c8',
  qualified: '#8b8be6',
  proposal: '#5b5bd6',
  won: '#1f9d63',
  lost: '#e5484d',
};

interface ChartRow {
  stage: DealStage;
  label: string;
  value: number;
  count: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: ChartRow }[] }) {
  const row = payload?.[0]?.payload;
  if (!active || !row) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-lg ring-1 ring-line">
      <p className="font-semibold">{row.label}</p>
      <p className="text-muted">
        {formatMoney(row.value)} · {row.count} {row.count === 1 ? 'deal' : 'deals'}
      </p>
    </div>
  );
}

/** Pipeline value per stage (all five stages, zero-filled). */
export function PipelineChart({ data }: { data: Dashboard['pipelineByStage'] }) {
  const rows: ChartRow[] = DEAL_STAGES.map(({ value: stage }) => {
    const hit = data.find((d) => d.stage === stage);
    return { stage, label: stageLabel(stage), value: hit?.value ?? 0, count: hit?.count ?? 0 };
  });

  if (rows.every((r) => r.count === 0)) {
    return <p className="flex h-64 items-center justify-center text-sm text-muted">No deals yet — the chart fills in as you add deals.</p>;
  }

  return (
    <div className="h-64 w-full" role="img" aria-label={rows.map((r) => `${r.label}: ${formatMoney(r.value)}`).join(', ')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e8eaf1" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#6b7185', fontSize: 12 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: '#6b7185', fontSize: 12 }}
            tickFormatter={(v: number) => formatMoneyCompact(v)}
          />
          <Tooltip cursor={{ fill: '#f2f2fd' }} content={<ChartTooltip />} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {rows.map((r) => (
              <Cell key={r.stage} fill={BAR_COLOR[r.stage]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
