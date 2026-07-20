import ForceShield from "../shared/ForceShield";

export default function ShieldOverlay({
  accent,
  active,
}: {
  accent: string;
  active: boolean;
}) {
  return (
    <ForceShield
      color={accent}
      active={active}
      scale={1.15}
      className="absolute inset-0 z-20 overflow-hidden rounded-2xl"
    />
  );
}
