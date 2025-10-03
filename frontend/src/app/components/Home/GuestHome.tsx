'use client';
import styles from '../../css/Home.module.css';
// import Header from '../../components/Home/Header';
// import LandingPage1 from './LandingPage1';
import LandingPage2 from './LandingPage2';

export default function GuestHome() {
    return (
        <div className={styles.container}>
            {/* <LandingPage1 /> */}
            <LandingPage2 />
        </div>
    );
}
