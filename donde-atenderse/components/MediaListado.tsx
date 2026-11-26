import Image from "next/image";

export function inicialesNombre(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function AvatarProfesionalListado({
  nombre,
  photoUrl,
  tamano = "mediano",
}: {
  nombre: string;
  photoUrl: string;
  tamano?: "chico" | "lista" | "mediano";
}) {
  const px =
    tamano === "chico" ? "h-11 w-11 text-xs" : tamano === "lista" ? "h-14 w-14 text-sm" : "h-16 w-16 text-base";
  const foto = photoUrl.trim();

  if (foto) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-full border border-line bg-white ${px}`}>
        <Image
          src={foto}
          alt=""
          fill
          className="object-cover"
          sizes={tamano === "chico" ? "44px" : tamano === "lista" ? "56px" : "64px"}
          unoptimized
        />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border border-line bg-[#eef4f8] font-bold text-link ${px}`}
    >
      {inicialesNombre(nombre) || "?"}
    </div>
  );
}

export function LogoLugarListado({
  nombre,
  logoUrl,
  tamano = "mediano",
}: {
  nombre: string;
  logoUrl: string;
  tamano?: "chico" | "lista" | "mediano";
}) {
  const px =
    tamano === "chico" ? "h-11 w-11 text-xs" : tamano === "lista" ? "h-14 w-14 text-sm" : "h-16 w-16 text-sm";
  const logo = logoUrl.trim();

  if (logo) {
    return (
      <div className={`relative shrink-0 overflow-hidden rounded-xl border border-line bg-white ${px}`}>
        <Image
          src={logo}
          alt=""
          fill
          className="object-contain p-1"
          sizes={tamano === "chico" ? "44px" : tamano === "lista" ? "56px" : "64px"}
          unoptimized
        />
      </div>
    );
  }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-line bg-[#eef4f8] font-bold text-link ${px}`}
    >
      {inicialesNombre(nombre).slice(0, 2) || "?"}
    </div>
  );
}