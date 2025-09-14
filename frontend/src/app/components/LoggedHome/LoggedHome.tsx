'use client';
import Link from 'next/link';
import styles from './css/LoggedHome.module.css'
import Image from 'next/image';

export default function LoggedHome() {
  return (
    <header className={styles.header}>
      <Image src="/assets/logo-blanco-sin-texto.png"
        width={80}
        height={80}
        alt='logo blanco combat strike'
        style={{cursor: 'pointer'}}
      />
      <Image
        src="/assets/usuario-sin-logo.png"
        width={55}
        height={55}
        alt='logo texto combat strike'
        style={{ position: 'absolute', right: '4%', borderRadius: '50%', cursor: 'pointer' }}
      />
    </header>
  );
}
