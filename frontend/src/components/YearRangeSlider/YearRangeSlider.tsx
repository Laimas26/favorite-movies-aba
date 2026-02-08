import { useCallback } from 'react';
import catSlider from '../../assets/cat-slider.png';
import styles from './YearRangeSlider.module.css';

interface Props {
  min: number;
  max: number;
  valueFrom: number;
  valueTo: number;
  step?: number;
  onChange: (from: number, to: number) => void;
}

export default function YearRangeSlider({ min, max, valueFrom, valueTo, step = 1, onChange }: Props) {
  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      onChange(Math.min(val, valueTo), valueTo);
    },
    [valueTo, onChange],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      onChange(valueFrom, Math.max(val, valueFrom));
    },
    [valueFrom, onChange],
  );

  const range = max - min;
  const leftPercent = ((valueFrom - min) / range) * 100;
  const rightPercent = ((valueTo - min) / range) * 100;

  return (
    <div className={styles.container}>
      <span className={styles.label}>{valueFrom}</span>
      <div className={styles.sliderWrapper} style={{ '--cat-thumb': `url(${catSlider})` } as React.CSSProperties}>
        <div className={styles.track} />
        <div
          className={styles.trackFill}
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />
        <input
          type="range"
          className={styles.thumb}
          min={min}
          max={max}
          step={step}
          value={valueFrom}
          onChange={handleFromChange}
        />
        <input
          type="range"
          className={styles.thumb}
          min={min}
          max={max}
          step={step}
          value={valueTo}
          onChange={handleToChange}
        />
      </div>
      <span className={styles.label}>{valueTo}</span>
    </div>
  );
}
