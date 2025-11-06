"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "../components/Home/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthContext } from "../context/AuthContext";
import styles from "./AccountPage.module.css";

const maskEmail = (email: string | undefined) => {
    if (!email) return "correo oculto";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    const maskedName =
        name.length <= 2
            ? `${name[0] ?? ""}***`
            : `${name[0]}${"*".repeat(Math.max(name.length - 2, 2))}${name.slice(-1)}`;
    return `${maskedName}@${domain}`;
};

const MASKED_PASSWORD = "••••••••";

type AccountEditModalProps = {
    initialName: string;
    email: string;
    onClose: () => void;
    onSave: (name: string) => Promise<void> | void;
};

function AccountEditModal({ initialName, email, onClose, onSave }: AccountEditModalProps) {
    const [name, setName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(initialName);
    }, [initialName]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSave || isSaving) return;
        setIsSaving(true);
        try {
            await onSave(name.trim());
        } finally {
            setIsSaving(false);
        }
    };

    const canSave = name.trim().length > 1 && name.trim() !== initialName.trim();

    return (
        <div className={styles.modalOverlay} onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="account-modal-title">
                <button type="button" className={styles.closeButton} aria-label="Cerrar" onClick={onClose}>
                    ×
                </button>
                <header className={styles.modalHeader}>
                    <span className={styles.modalEyebrow}>Perfil</span>
                    <h3 id="account-modal-title">Actualizar perfil</h3>
                    <p>
                        Modifica tu nombre visible. Para cambiar correo o contraseña iniciamos un flujo seguro de
                        verificación.
                    </p>
                </header>
                <form className={styles.modalBody} onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.fieldLabel} htmlFor="account-name">
                            Nombre
                        </label>
                        <input
                            id="account-name"
                            className={styles.input}
                            placeholder="Tu nombre"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                    </div>
                    <div className={styles.fieldGroupInline}>
                        <div className={styles.fieldGroupCompact}>
                            <span className={styles.fieldLabel}>Correo</span>
                            <span className={styles.disabledField}>{maskEmail(email)}</span>
                        </div>
                        <button type="button" className={styles.inlineAction}>
                            Iniciar verificación
                        </button>
                    </div>
                    <div className={styles.fieldGroupInline}>
                        <div className={styles.fieldGroupCompact}>
                            <span className={styles.fieldLabel}>Contraseña</span>
                            <span className={styles.disabledField}>{MASKED_PASSWORD}</span>
                        </div>
                        <button type="button" className={styles.inlineAction}>
                            Actualizar
                        </button>
                    </div>
                    <p className={styles.helperText}>
                        Estas acciones requieren confirmar tu identidad. Te guiaremos con códigos temporales y correo de
                        verificación.
                    </p>
                    <footer className={styles.modalFooter}>
                        <button type="button" className={styles.ghostButton} onClick={onClose} disabled={isSaving}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.saveButton} disabled={!canSave || isSaving}>
                            {isSaving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
}

export default function AccountPage() {
    const router = useRouter();
    const { isAuthenticated, checkingAuth, user, setUser } = useAuthContext();
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (!checkingAuth && !isAuthenticated) {
            router.replace("/");
        }
    }, [checkingAuth, isAuthenticated, router]);

    if (checkingAuth || !isAuthenticated) {
        return (
            <div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <LoadingSpinner />
            </div>
        );
    }

    const stats = [
        { label: "Cursos completados", value: "3" },
        { label: "Horas de práctica", value: "48 h" },
        { label: "Insignias", value: "5" },
        { label: "Último acceso", value: "Hace 2 días" },
    ];

    const preferences = [
        { label: "Plan táctico semanal", action: "Editar" },
        { label: "Alertas de progreso", action: "Configurar" },
        { label: "Notificaciones push", action: "Administrar" },
    ];

    const security = [
        { label: "Correo verificado", status: "Sí" },
        { label: "Autenticación 2FA", status: "Pendiente" },
        { label: "Sesiones activas", status: "2 dispositivos" },
    ];

    const activity = [
        { label: "Actualizaste tu perfil táctico", time: "Hace 4 horas" },
        { label: "Completaste módulo 'Respuestas rápidas'", time: "Ayer" },
        { label: "Compraste 'Uso seguro de sprays'", time: "Hace 5 días" },
    ];

    const handleOpenEdit = () => setEditModalOpen(true);
    const handleCloseEdit = () => setEditModalOpen(false);
    const handleSaveName = async (newName: string) => {
        setUser((prev) => (prev ? { ...prev, name: newName } : prev));
        setEditModalOpen(false);
        // TODO: llamar al endpoint real para persistir el cambio
    };

    return (
        <>
            <div className={styles.accountWrapper}>
                <div className={styles.accountContent}>
                    <section className={styles.profileHero}>
                        <div className={styles.profileInfo}>
                            <span className={styles.accountStatus}>Cuenta activa</span>
                            <h1>Hola, {user?.name ?? "Combatiente"} ⚡</h1>
                            <p className={styles.profileSubtitle}>
                                Gestiona tu identidad, tus accesos y tus próximos objetivos desde un solo lugar.
                            </p>
                            <div className={styles.badgeRow}>
                                <span className={styles.badge}>{maskEmail(user?.email)}</span>
                            </div>
                            <div className={styles.actionsRow}>
                                <button type="button" className={styles.primaryAction} onClick={handleOpenEdit}>
                                    Actualizar perfil
                                </button>
                                <button type="button" className={styles.secondaryAction}>
                                    Ajustes de seguridad
                                </button>
                            </div>
                        </div>
                        <div className={styles.statsPanel}>
                            <h3>Resumen táctico</h3>
                            <div className={styles.statsGrid}>
                                {stats.map((item) => (
                                    <div key={item.label} className={styles.statCard}>
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Preferencias</h2>
                            <small>Personaliza cómo quieres entrenar y recibir recordatorios.</small>
                        </div>
                        <div className={styles.preferenceList}>
                            {preferences.map((pref) => (
                                <div key={pref.label} className={styles.preferenceItem}>
                                    <span>{pref.label}</span>
                                    <button type="button">{pref.action}</button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Seguridad</h2>
                            <small>Control de acceso y dispositivos vinculados.</small>
                        </div>
                        <div className={styles.preferenceList}>
                            {security.map((item) => (
                                <div key={item.label} className={styles.preferenceItem}>
                                    <span>{item.label}</span>
                                    <strong>{item.status}</strong>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2>Actividad reciente</h2>
                            <small>Últimos movimientos de tu cuenta.</small>
                        </div>
                        <div className={styles.activityList}>
                            {activity.map((log) => (
                                <div key={log.label} className={styles.activityCard}>
                                    <span>{log.label}</span>
                                    <button type="button">{log.time}</button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
            <Footer />
            {isEditModalOpen && (
                <AccountEditModal
                    initialName={user?.name ?? ""}
                    email={user?.email ?? ""}
                    onClose={handleCloseEdit}
                    onSave={handleSaveName}
                />
            )}
        </>
    );
}
