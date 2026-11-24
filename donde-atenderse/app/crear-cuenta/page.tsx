import Link from "next/link";

export default function CrearCuenta() {
  return (
    <div className="grid max-w-xl gap-6">
      <h1 className="text-4xl font-bold tracking-tight">Alta de cuentas</h1>
      <p className="text-muted">
        Las cuentas las crea la administración de Cercalud. Si sos profesional o trabajás en la secretaría de un lugar,
        pediles el correo y la contraseña y entrá por acá.
      </p>
      <Link href="/entrar" className="boton w-fit">
        Ir a entrar
      </Link>
    </div>
  );
}