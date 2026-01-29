"use client";

import { useEffect, useState } from "react";

interface Inscripcion {
  id: string;
  estado: string;
  fechaInscripcion: string;
  curso: {
    nombre: string;
    escuela: {
      nombre: string;
    };
  };
  factura?: {
    numero: string;
    estado: string;
    monto: number;
  };
}

interface Nota {
  id: string;
  calificacion: number;
  periodo: string;
  materia: {
    nombre: string;
    curso: {
      nombre: string;
    };
  };
}

interface Certificado {
  id: string;
  numero: string;
  fechaEmision: string;
  promedio: number;
  curso: {
    nombre: string;
    escuela: {
      nombre: string;
    };
  };
}

export default function AlumnoDashboard() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inscripciones" | "notas" | "certificados">("inscripciones");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inscripcionesRes, notasRes, certificadosRes] = await Promise.all([
        fetch("/api/inscripciones"),
        fetch("/api/notas"),
        fetch("/api/certificados"),
      ]);

      const inscripcionesData = await inscripcionesRes.json();
      const notasData = await notasRes.json();
      const certificadosData = await certificadosRes.json();

      setInscripciones(inscripcionesData);
      setNotas(notasData);
      setCertificados(certificadosData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const estadoLabels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    INSCRITO: "Inscrito",
    CANCELADO: "Cancelado",
  };

  const estadoColors: Record<string, string> = {
    PENDIENTE: "bg-secondary text-secondary-foreground",
    INSCRITO: "bg-primary text-primary-foreground",
    CANCELADO: "bg-destructive text-destructive-foreground",
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div>
      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("inscripciones")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "inscripciones"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Inscripciones
          </button>
          <button
            onClick={() => setActiveTab("notas")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "notas"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Notas
          </button>
          <button
            onClick={() => setActiveTab("certificados")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "certificados"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
          >
            Certificados
          </button>
        </nav>
      </div>

      {activeTab === "inscripciones" && (
        <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-border">
            {inscripciones.length === 0 ? (
              <li className="px-6 py-4 text-center text-muted-foreground">
                No tienes inscripciones
              </li>
            ) : (
              inscripciones.map((inscripcion) => (
                <li key={inscripcion.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-foreground">
                          {inscripcion.curso.escuela.nombre} - {inscripcion.curso.nombre}
                        </p>
                        <span
                          className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${estadoColors[inscripcion.estado]
                            }`}
                        >
                          {estadoLabels[inscripcion.estado]}
                        </span>
                      </div>
                      {inscripcion.factura && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          Factura: {inscripcion.factura.numero} - Estado: {inscripcion.factura.estado} - Monto: G. {inscripcion.factura.monto.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {activeTab === "notas" && (
        <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-border">
            {notas.length === 0 ? (
              <li className="px-6 py-4 text-center text-muted-foreground">
                No tienes notas registradas
              </li>
            ) : (
              notas.map((nota) => (
                <li key={nota.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {nota.materia.nombre}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {nota.materia.curso.nombre} - Período: {nota.periodo}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span className="text-lg font-semibold text-foreground">
                        {Number(nota.calificacion).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {activeTab === "certificados" && (
        <div className="bg-card border shadow-sm overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-border">
            {certificados.length === 0 ? (
              <li className="px-6 py-4 text-center text-muted-foreground">
                No tienes certificados
              </li>
            ) : (
              certificados.map((certificado) => (
                <li key={certificado.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {certificado.curso.escuela.nombre} - {certificado.curso.nombre}
                      </p>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Certificado: {certificado.numero} - Promedio: {Number(certificado.promedio).toFixed(2)}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground/70">
                        Emitido: {new Date(certificado.fechaEmision).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="ml-4">
                      <button className="text-primary hover:underline text-sm font-medium">
                        Descargar
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

