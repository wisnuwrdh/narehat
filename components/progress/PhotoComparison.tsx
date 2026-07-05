import { cn } from "@/lib/utils";
import Image from "next/image";

interface PhotoComparisonProps {
  beforeUrl: string;
  afterUrl: string;
  beforeDate: string;
  afterDate: string;
}

export function PhotoComparison({
  beforeUrl,
  afterUrl,
  beforeDate,
  afterDate,
}: PhotoComparisonProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden">
        <div className="aspect-square bg-slate-100 relative">
          {beforeUrl ? (
            <Image
              src={beforeUrl}
              alt="Sebelum"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">
              No photo
            </div>
          )}
        </div>
        <div className="p-2 text-center">
          <span className="text-[10px] text-muted">Baseline</span>
          <span className="text-[10px] text-muted-light block">
            {beforeDate}
          </span>
        </div>
      </div>
      <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden">
        <div className="aspect-square bg-slate-100 relative">
          {afterUrl ? (
            <Image
              src={afterUrl}
              alt="Sekarang"
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted text-xs">
              No photo
            </div>
          )}
        </div>
        <div className="p-2 text-center">
          <span className="px-1.5 py-0.5 bg-primary text-white text-[8px] font-bold rounded-md">
            Now
          </span>
          <span className="text-[10px] text-muted-light block">
            {afterDate}
          </span>
        </div>
      </div>
    </div>
  );
}
