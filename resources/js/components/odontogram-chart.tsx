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

const upperRightPrimary = [55, 54, 53, 52, 51];
const upperLeftPrimary = [61, 62, 63, 64, 65];
const lowerRightPrimary = [85, 84, 83, 82, 81];
const lowerLeftPrimary = [71, 72, 73, 74, 75];

const conditionLabels: Record<string, string> = {
    diente_erupcionado: 'Diente erupcionado',
    caries: 'Caries',
    obturado: 'Obturado',
    extraido: 'Extraído',
    corona_provisional: 'Corona provisional',
    bruxismo: 'Bruxismo',
    restauracion_provisional: 'Restauración provisional',
    protesis_fija: 'Prótesis fija',
    corona: 'Corona',
    protesis_removible: 'Prótesis removible',
    incrustacion_estetica: 'Incrustación estética',
    endodoncia: 'Endodoncia',
    fractura_dental: 'Fractura dental',
    movilidad_patologica: 'Movilidad patológica',
    pieza_mal_posicionada: 'Pieza mal posicionada',
    tratamiento_conductos: 'Tratamiento de conductos',
    fractura: 'Fractura',
    implante: 'Implante',
    mancha_blanca: 'Mancha blanca',
    sellante: 'Sellante',
    surco_profundo: 'Surco profundo',
    hipoplasia: 'Hipoplasia',
    sano: 'Sano',
};

const conditionCodes: Record<string, string> = {
    diente_erupcionado: 'De',
    caries: 'C',
    obturado: '=',
    extraido: 'X',
    corona_provisional: 'CP',
    bruxismo: 'B',
    restauracion_provisional: 'RP',
    protesis_fija: 'PF',
    corona: 'Cr',
    protesis_removible: 'Pr',
    incrustacion_estetica: 'Iec',
    endodoncia: 'EP',
    fractura_dental: 'FD',
    movilidad_patologica: 'MPD',
    pieza_mal_posicionada: 'PM',
    tratamiento_conductos: 'TC',
    fractura: 'F',
    implante: 'Imp',
    mancha_blanca: 'MB',
    sellante: 'Se',
    surco_profundo: 'SP',
    hipoplasia: 'Hp',
    sano: 'S',
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
    diente_erupcionado:
        'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200',
    corona_provisional:
        'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
    bruxismo:
        'border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200',
    restauracion_provisional:
        'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200',
    protesis_fija:
        'border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200',
    protesis_removible:
        'border-indigo-300 bg-indigo-50 text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200',
    incrustacion_estetica:
        'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-200',
    fractura_dental:
        'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200',
    movilidad_patologica:
        'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200',
    pieza_mal_posicionada:
        'border-purple-300 bg-purple-50 text-purple-900 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-200',
    tratamiento_conductos:
        'border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200',
    mancha_blanca:
        'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-200',
    surco_profundo:
        'border-cyan-300 bg-cyan-50 text-cyan-900 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-200',
    hipoplasia:
        'border-lime-300 bg-lime-50 text-lime-900 dark:border-lime-800 dark:bg-lime-950/50 dark:text-lime-200',
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
    const code = latest
        ? (conditionCodes[latest.condition] ?? latest.condition)
        : '—';
    const label = latest
        ? (conditionLabels[latest.condition] ?? latest.condition)
        : 'Sin registro';

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={`Pieza ${tooth}: ${label}`}
            title={
                related.length
                    ? related
                          .map(
                              (entry) =>
                                  `${surfaceLabels[entry.surface ?? ''] ? `${surfaceLabels[entry.surface ?? '']}: ` : ''}${conditionCodes[entry.condition] ?? entry.condition} · ${conditionLabels[entry.condition] ?? entry.condition}`,
                          )
                          .join(' · ')
                    : 'Sin registro'
            }
            className={cn(
                'relative flex h-16 flex-col items-center justify-center gap-0.5 rounded-md border px-1 text-center text-xs transition-colors',
                latest
                    ? (conditionStyles[latest.condition] ??
                          'border-border bg-muted text-foreground')
                    : 'border-dashed bg-card text-muted-foreground',
                onSelect && 'hover:ring-2 hover:ring-primary/40',
                selected && 'ring-2 ring-primary ring-offset-1',
            )}
        >
            <span className="absolute top-0.5 left-1 text-[9px] font-medium opacity-70">
                {tooth}
            </span>
            <span className="text-base font-semibold">{code}</span>
            <span className="line-clamp-1 text-[9px] leading-tight">
                {label}
            </span>
            {related.length > 1 && (
                <span className="absolute top-0.5 right-1 rounded-full bg-background/80 px-1 text-[9px] font-medium">
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
        <div
            className="grid gap-1.5"
            style={{
                gridTemplateColumns: `repeat(${teeth.length}, minmax(0, 1fr))`,
            }}
        >
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

function Arcade({
    title,
    rightTeeth,
    leftTeeth,
    entries,
    selectedTooth,
    onSelectTooth,
}: Props & {
    title: string;
    rightTeeth: number[];
    leftTeeth: number[];
}) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {title}
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
                <Quadrant
                    teeth={rightTeeth}
                    entries={entries}
                    selectedTooth={selectedTooth}
                    onSelectTooth={onSelectTooth}
                />
                <Quadrant
                    teeth={leftTeeth}
                    entries={entries}
                    selectedTooth={selectedTooth}
                    onSelectTooth={onSelectTooth}
                />
            </div>
        </div>
    );
}

export function OdontogramChart({
    entries,
    selectedTooth,
    onSelectTooth,
}: Props) {
    return (
        <div className="space-y-4">
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
                <Arcade
                    title="Superior derecho · Superior izquierdo"
                    rightTeeth={upperRight}
                    leftTeeth={upperLeft}
                    entries={entries}
                    selectedTooth={selectedTooth}
                    onSelectTooth={onSelectTooth}
                />
                <Arcade
                    title="Temporales superiores"
                    rightTeeth={upperRightPrimary}
                    leftTeeth={upperLeftPrimary}
                    entries={entries}
                    selectedTooth={selectedTooth}
                    onSelectTooth={onSelectTooth}
                />
                <div className="h-px bg-border" />
                <Arcade
                    title="Temporales inferiores"
                    rightTeeth={lowerRightPrimary}
                    leftTeeth={lowerLeftPrimary}
                    entries={entries}
                    selectedTooth={selectedTooth}
                    onSelectTooth={onSelectTooth}
                />
                <Arcade
                    title="Inferior derecho · Inferior izquierdo"
                    rightTeeth={lowerRight}
                    leftTeeth={lowerLeft}
                    entries={entries}
                    selectedTooth={selectedTooth}
                    onSelectTooth={onSelectTooth}
                />
            </div>

            <div className="grid gap-1.5 text-xs sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(conditionLabels).map(([condition, label]) => (
                    <div
                        key={condition}
                        className="flex items-center gap-2 rounded-md border bg-card px-2 py-1"
                    >
                        <span
                            className={cn(
                                'inline-flex h-6 min-w-8 items-center justify-center rounded border px-1 text-[10px] font-semibold',
                                conditionStyles[condition] ??
                                    'border-border bg-muted',
                            )}
                        >
                            {conditionCodes[condition] ?? condition}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
