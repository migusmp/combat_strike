'use client';
import styles from '../../css/Home.module.css';
import Header from './Header';
// import UserDashboard from './UserDashboard';
import Footer from './Footer';

export default function LoggedHome() {
  return (
    <div className={styles.container}>
      <p>HOLA, ESTAS LOGUEADO MI BRO</p>
      <Footer />
    </div>
  );
}
