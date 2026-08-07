#!/usr/bin/env bash
# Run SCAN UX cases individually; each hard-capped at 45s.
set -u
BASE="${ACCEPT_BASE:-http://127.0.0.1:4173/off-course}"
export ACCEPT_BASE="$BASE"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/artifacts/accept-scan-cases"
mkdir -p "$OUT"
SUMMARY="$OUT/summary.json"
: >"$OUT/summary.ndjson"

run_case() {
  local case_name="$1" vp="$2" idle_ms="$3" label="$4"
  local log="$OUT/${label}.log"
  echo "=== RUN $label CASE=$case_name VP=$vp IDLE_MS=$idle_ms ==="
  if timeout 45s env CASE="$case_name" VP="$vp" IDLE_MS="$idle_ms" \
    node "$ROOT/scripts/accept-scan-case.mjs" >"$log" 2>&1; then
    echo "{\"label\":\"$label\",\"ok\":true}" | tee -a "$OUT/summary.ndjson"
    echo "PASS $label"
    return 0
  else
    local ec=$?
    echo "{\"label\":\"$label\",\"ok\":false,\"exit\":$ec}" | tee -a "$OUT/summary.ndjson"
    echo "FAIL $label exit=$ec"
    tail -20 "$log" || true
    return 1
  fi
}

fails=0
# Priority: 30s idle + click
run_case idle-click 1324x977 30000 idle30-1324x977 || fails=$((fails + 1))
run_case idle-click 390x844 30000 idle30-390x844 || fails=$((fails + 1))
# Secondary: 8s idle + click
run_case idle-click 1440x900 8000 idle8-1440x900 || fails=$((fails + 1))
run_case idle-click 430x932 8000 idle8-430x932 || fails=$((fails + 1))
# Interaction extras (single viewport, bounded)
run_case early 1324x977 0 early-1324x977 || fails=$((fails + 1))
run_case keyboard 1324x977 0 keyboard-1324x977 || fails=$((fails + 1))
run_case preset 1324x977 0 preset-1324x977 || fails=$((fails + 1))

python3 - <<PY
import json, pathlib
p = pathlib.Path("$OUT/summary.ndjson")
rows = [json.loads(l) for l in p.read_text().splitlines() if l.strip()]
summary = {"ok": all(r.get("ok") for r in rows), "cases": rows, "blocking_prior": "waitPhase(settle) after Escape @ accept-scan-ux.mjs:183 (8s timeout) — suite replaced with bounded cases"}
pathlib.Path("$SUMMARY").write_text(json.dumps(summary, indent=2))
print(json.dumps(summary, indent=2))
raise SystemExit(0 if summary["ok"] else 1)
PY
exit $?
