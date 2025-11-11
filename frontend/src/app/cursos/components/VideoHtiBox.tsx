import mobileStyles from "../css/MobilePurchasedCourseContent.module.css";

export default function VideoHitbox({
  isOverlayVisible,
  onTap,
}: {
  isOverlayVisible: boolean;
  onTap: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      className={`${mobileStyles.hitbox} ${
        isOverlayVisible ? mobileStyles.hitboxDisabled : ""
      }`}
      onPointerDown={(e) => {
        // evita que luego llegue un click sintético
        e.preventDefault();
        e.stopPropagation();
        onTap(e);
      }}
      aria-hidden
    />
  );
}
