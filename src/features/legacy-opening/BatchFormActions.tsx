import { ChevronsRight, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Both actions add to the local session until backend saving is available. */
export function BatchFormActions({ editing, clear }: { editing: boolean; clear: () => void }) {
  return (
    <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4">
      <Button variant="secondary" icon={RotateCcw} onClick={clear}>Clear</Button>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="secondary" icon={Plus}>{editing ? "Update entry" : "Add to batch"}</Button>
        <Button type="submit" icon={ChevronsRight}>Save &amp; Next</Button>
      </div>
    </div>
  );
}
