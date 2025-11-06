'use client';
import React from 'react';
import styles from '../css/LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.glow} />
      <div className={styles.spinner}>
        <div className={styles.ring} />
        <div className={styles.ring} />
        <div className={styles.core} />
      </div>
      <p>Cargando tu espacio…</p>
    </div>
  );
}
