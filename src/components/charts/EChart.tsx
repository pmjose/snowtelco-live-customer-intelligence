import ReactECharts from 'echarts-for-react';
import type { CSSProperties } from 'react';

export function EChart({ option, style, height = 220 }: { option: any; style?: CSSProperties; height?: number }) {
  return (
    <ReactECharts
      option={option}
      notMerge
      lazyUpdate
      style={{ width: '100%', height, ...style }}
      opts={{ renderer: 'canvas' }}
    />
  );
}
