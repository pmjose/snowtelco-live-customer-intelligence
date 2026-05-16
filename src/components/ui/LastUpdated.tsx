import { useEffect, useState } from 'react';

export function LastUpdated({ baseSeconds = 12 }: { baseSeconds?: number }) {
  const [secs, setSecs] = useState(baseSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-[10px] text-ink-muted">Last updated {secs}s ago</span>;
}
