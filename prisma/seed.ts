import { PrismaClient, Rol } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de base de datos...");

  // Crear usuarios de ejemplo
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Usuario Admin
  const admin = await prisma.usuario.upsert({
    where: { email: "admin@arpar.mil.py" },
    update: {},
    create: {
      email: "admin@arpar.mil.py",
      password: hashedPassword,
      nombre: "Administrador",
      apellido: "Sistema",
      cedula: "1000000",
      rol: Rol.ADMIN,
    },
  });
  console.log("✅ Usuario Admin creado:", admin.email);

  // Usuario Encargado
  const encargado = await prisma.usuario.upsert({
    where: { email: "encargado@arpar.mil.py" },
    update: {},
    create: {
      email: "encargado@arpar.mil.py",
      password: hashedPassword,
      nombre: "Juan",
      apellido: "Pérez",
      cedula: "2000000",
      rol: Rol.ENCARGADO,
    },
  });
  console.log("✅ Usuario Encargado creado:", encargado.email);

  // Usuario Cajero
  const cajero = await prisma.usuario.upsert({
    where: { email: "cajero@arpar.mil.py" },
    update: {},
    create: {
      email: "cajero@arpar.mil.py",
      password: hashedPassword,
      nombre: "María",
      apellido: "González",
      cedula: "3000000",
      rol: Rol.CAJERO,
    },
  });
  console.log("✅ Usuario Cajero creado:", cajero.email);

  // Usuario Profesor
  const profesor = await prisma.usuario.upsert({
    where: { email: "profesor@arpar.mil.py" },
    update: {},
    create: {
      email: "profesor@arpar.mil.py",
      password: hashedPassword,
      nombre: "Carlos",
      apellido: "Rodríguez",
      cedula: "4000000",
      rol: Rol.PROFESOR,
    },
  });
  console.log("✅ Usuario Profesor creado:", profesor.email);

  // Usuario Jefe de Estudios
  const jefeEstudios = await prisma.usuario.upsert({
    where: { email: "jefe@arpar.mil.py" },
    update: {},
    create: {
      email: "jefe@arpar.mil.py",
      password: hashedPassword,
      nombre: "Ana",
      apellido: "Martínez",
      cedula: "5000000",
      rol: Rol.JEFE_ESTUDIOS,
    },
  });
  console.log("✅ Usuario Jefe de Estudios creado:", jefeEstudios.email);

  // Usuario Alumno
  const alumno = await prisma.usuario.upsert({
    where: { email: "alumno@arpar.mil.py" },
    update: {},
    create: {
      email: "alumno@arpar.mil.py",
      password: hashedPassword,
      nombre: "Pedro",
      apellido: "López",
      cedula: "6000000",
      rol: Rol.ALUMNO,
    },
  });
  console.log("✅ Usuario Alumno creado:", alumno.email);

  // Crear Escuela Náutica
  const escuelaNautica = await prisma.escuela.upsert({
    where: { codigo: "EN-001" },
    update: {},
    create: {
      nombre: "Escuela Náutica",
      codigo: "EN-001",
      descripcion: "Escuela de formación náutica de la Armada Paraguaya",
      activa: true,
    },
  });
  console.log("✅ Escuela creada:", escuelaNautica.nombre);

  // Crear Curso de ejemplo
  const curso = await prisma.cursos.upsert({
    where: {
      escuelaId_codigo: {
        escuelaId: escuelaNautica.id,
        codigo: "CUR-001",
      },
    },
    update: {},
    create: {
      nombre: "Curso de Navegación Básica",
      codigo: "CUR-001",
      descripcion: "Curso introductorio de navegación",
      costo: 500000,
      activo: true,
      escuelaId: escuelaNautica.id,
    },
  });
  console.log("✅ Curso creado:", curso.nombre);

  // Crear Materia de ejemplo
  const materia = await prisma.materia.upsert({
    where: {
      cursoId_codigo: {
        cursoId: curso.id,
        codigo: "MAT-001",
      },
    },
    update: {},
    create: {
      nombre: "Navegación Costera",
      codigo: "MAT-001",
      descripcion: "Fundamentos de navegación costera",
      activa: true,
      cursoId: curso.id,
    },
  });
  console.log("✅ Materia creada:", materia.nombre);

  // Asignar materia al profesor
  await prisma.materiaProfesor.upsert({
    where: {
      materiaId_profesorId: {
        materiaId: materia.id,
        profesorId: profesor.id,
      },
    },
    update: {},
    create: {
      materiaId: materia.id,
      profesorId: profesor.id,
    },
  });
  console.log("✅ Materia asignada al profesor");

  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n📝 Credenciales de acceso:");
  console.log("   Todos los usuarios tienen la contraseña: 123456");
  console.log("\n   Admin: admin@arpar.mil.py");
  console.log("   Encargado: encargado@arpar.mil.py");
  console.log("   Cajero: cajero@arpar.mil.py");
  console.log("   Profesor: profesor@arpar.mil.py");
  console.log("   Jefe de Estudios: jefe@arpar.mil.py");
  console.log("   Alumno: alumno@arpar.mil.py");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

