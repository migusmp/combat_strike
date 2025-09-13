'use client';
import React from 'react';
import styles from '../css/LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando...</p>
    </div>
  );
}
