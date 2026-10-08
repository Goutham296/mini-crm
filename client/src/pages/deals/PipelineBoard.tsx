import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { DEAL_STAGES } from '../../lib/constants';
import { formatMoneyCompact } from '../../lib/format';
import type { Deal, DealStage } from '../../lib/types';
import { DealCard } from './DealCard';

interface PipelineBoardProps {
  deals: Deal[];
  onMove: (deal: Deal, stage: DealStage) => void;
  onEdit: (d: Deal) => void;
  onDelete: (d: Deal) => void;
}

const COLUMN_ACCENT: Record<DealStage, string> = {
  lead: 'bg-slate-400',
  qualified: 'bg-primary-100',
  proposal: 'bg-primary',
  won: 'bg-success',
  lost: 'bg-danger',
};

function DraggableDeal({ deal, ...rest }: { deal: Deal } & Omit<PipelineBoardProps, 'deals'>) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id, data: { deal } });
  return (
    // The DragOverlay follows the pointer; the original stays in place, dimmed.
    <li ref={setNodeRef}>
      <DealCard
        deal={deal}
        dragging={isDragging}
        handleProps={{ ...attributes, ...listeners }}
        onEdit={rest.onEdit}
        onDelete={rest.onDelete}
        onStageChange={rest.onMove}
      />
    </li>
  );
}

function Column({ stage, label, deals, ...rest }: { stage: DealStage; label: string } & PipelineBoardProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const total = deals.reduce((sum, d) => sum + d.value, 0);
  return (
    <section
      ref={setNodeRef}
      aria-label={`${label} stage`}
      className={`flex min-w-0 flex-col rounded-card bg-canvas p-2.5 ring-2 transition-colors md:min-h-[420px] ${
        isOver ? 'ring-primary/50 bg-primary-50' : 'ring-transparent'
      }`}
    >
      <header className="mb-2.5 flex items-center gap-2 px-1">
        <span className={`size-2.5 rounded-full ${COLUMN_ACCENT[stage]}`} aria-hidden="true" />
        <h2 className="text-sm font-semibold">{label}</h2>
        <span className="rounded-full bg-white px-2 text-xs font-semibold text-muted ring-1 ring-line">{deals.length}</span>
        <span className="ml-auto text-xs font-semibold text-muted tabular-nums">{formatMoneyCompact(total)}</span>
      </header>
      {deals.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
          No deals — drop one here
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {deals.map((d) => (
            <DraggableDeal key={d.id} deal={d} {...rest} />
          ))}
        </ul>
      )}
    </section>
  );
}

/** Kanban board. Desktop: drag a card's handle between columns. Phones: use the stage select on each card. */
export function PipelineBoard({ deals, onMove, onEdit, onDelete }: PipelineBoardProps) {
  const [active, setActive] = useState<Deal | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const onDragStart = (e: DragStartEvent) => setActive((e.active.data.current?.deal as Deal | undefined) ?? null);
  const onDragEnd = (e: DragEndEvent) => {
    setActive(null);
    const deal = e.active.data.current?.deal as Deal | undefined;
    const stage = e.over?.id as DealStage | undefined;
    if (deal && stage && stage !== deal.stage) onMove(deal, stage);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActive(null)}
    >
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {DEAL_STAGES.map((s) => (
          <Column
            key={s.value}
            stage={s.value}
            label={s.label}
            deals={deals.filter((d) => d.stage === s.value)}
            onMove={onMove}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>{active ? <DealCard deal={active} overlay /> : null}</DragOverlay>
    </DndContext>
  );
}
