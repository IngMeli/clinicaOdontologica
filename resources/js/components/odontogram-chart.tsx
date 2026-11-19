import { cn } from '@/lib/utils';
import type { OdontogramEntry } from '@/types';

type Props = {
    entries: OdontogramEntry[];
    selectedTooth?: number | null;
    onSelectTooth?: (tooth: number) => void;
};

const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

const conditionLabels: Record<string, string> = {
    sano: 'Sano',
    caries: 'Caries',
    obturado: 'Obturado',
    corona: 'Corona',
    extraido: 'Extraído',
    endodoncia: 'Endodoncia',
    implante: 'Implante',
    sellante: 'Sellante',
    fractura: 'Fractura',
};

const conditionStyles: Record<string, string> = {
    sano: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
    caries: 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200',
    obturado:
        'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200',
    corona: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
    extraido:
        'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
    endodoncia:
        'border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
    implante:
        'border-teal-300 bg-teal-50 text-teal-900 dark:border-teal-800 dark:bg-teal-950/50 dark:text-teal-200',
    sellante:
        'border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200',
    fractura:
        'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200',
};

const surfaceLabels: Record<string, string> = {
    oclusal: 'O',
    mesial: 'M',
    distal: 'D',
    vestibular: 'V',
    lingual: 'L',
};

function toothEntries(entries: OdontogramEntry[], tooth: number) {
    return entries
        .filter((entry) => entry.tooth === tooth)
        .sort(
            (left, right) =>
                new Date(right.recorded_at).getTime() -
                new Date(left.recorded_at).getTime(),
        );
}

function Tooth({
    tooth,
    entries,
    selected,
    onSelect,
}: {
    tooth: number;
    entries: OdontogramEntry[];
    selected: boolean;
    onSelect?: () => void;
}) {
    const related = toothEntries(entries, tooth);
    const latest = related[0];
    const style = latest
        ? (conditionStyles[latest.condition] ??
          'border-border bg-muted text-foreground')
        : 'border-dashed bg-card text-muted-foreground';

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            title={
                related.length
                    ? related
                          .map(
                              (entry) =>
                                  `${surfaceLabels[entry.surface ?? ''] ? `${surfaceLabels[entry.surface ?? '']}: ` : ''}${conditionLabels[entry.condition] ?? entry.condition}`,
                          )
                          .join(' · ')
                    : 'Sin registro'
            }
            className={cn(
                'relative flex h-16 flex-col items-center justify-center gap-1 rounded-md border px-1 text-center text-xs transition-colors',
                style,
                onSelect && 'hover:ring-2 hover:ring-primary/40',
                selected && 'ring-2 ring-primary ring-offset-1',
            )}
        >
            <span className="font-semibold">{tooth}</span>
            <span className="line-clamp-2 text-[10px] leading-tight">
                {latest
                    ? (conditionLabels[latest.condition] ?? latest.condition)
                    : 'Sin registro'}
            </span>
            {related.length > 1 && (
                <span className="absolute top-1 right-1 rounded-full bg-background/80 px-1 text-[9px] font-medium">
                    {related.length}
                </span>
            )}
        </button>
    );
}

function Quadrant({
    teeth,
    entries,
    selectedTooth,
    onSelectTooth,
}: Props & { teeth: number[] }) {
    return (
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {teeth.map((tooth) => (
                <Tooth
                    key={tooth}
                    tooth={tooth}
                    entries={entries}
                    selected={selectedTooth === tooth}
                    onSelect={() => onSelectTooth?.(tooth)}
                />
            ))}
        </div>
    );
}

export function OdontogramChart({
    entries,
    selectedTooth,
    onSelectTooth,
}: Props) {
    const presentConditions = Array.from(
        new Set(entries.map((entry) => entry.condition)),
    );

    return (
        <div className="space-y-4">
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <span className="h-px flex-1 bg-border" />
                    Superior derecho
                    <span className="h-px flex-1 bg-border" />
                    Superior izquierdo
                </div>
                <div className="grid gap-3 lg:grid-cols-2">
                    <Quadrant
                        teeth={upperRight}
                        entries={entries}
                        selectedTooth={selectedTooth}
                        onSelectTooth={onSelectTooth}
                    />
                    <Quadrant
                        teeth={upperLeft}
                        entries={entries}
                        selectedTooth={selectedTooth}
                        onSelectTooth={onSelectTooth}
                    />
                </div>
                <div className="h-px bg-border" />
                <div className="grid gap-3 lg:grid-cols-2">
                    <Quadrant
                        teeth={lowerRight}
                        entries={entries}
                        selectedTooth={selectedTooth}
                        onSelectTooth={onSelectTooth}
                    />
                    <Quadrant
                        teeth={lowerLeft}
                        entries={entries}
                        selectedTooth={selectedTooth}
                        onSelectTooth={onSelectTooth}
                    />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    <span className="h-px flex-1 bg-border" />
                    Inferior derecho
                    <span className="h-px flex-1 bg-border" />
                    Inferior izquierdo
                </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
                {presentConditions.length === 0 && (
                    <span className="text-muted-foreground">
                        Sin hallazgos registrados.
                    </span>
                )}
                {presentConditions.map((condition) => (
                    <span
                        key={condition}
                        className={cn(
                            'rounded-full border px-2 py-0.5',
                            conditionStyles[condition] ??
                                'border-border bg-muted',
                        )}
                    >
                        {conditionLabels[condition] ?? condition}
                    </span>
                ))}
            </div>
        </div>
    );
}
