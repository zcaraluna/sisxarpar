"use client";

import { useState, useEffect } from "react";
import Select from "react-select";
import Input from "@/components/ui/Input";
import "@/app/globals.css";

interface DireccionSelectProps {
  value?: {
    departamento?: string;
    ciudad?: string;
    barrio?: string;
  };
  onChange: (direccion: {
    departamento?: string;
    ciudad?: string;
    barrio?: string;
  }) => void;
  error?: string;
}

export default function DireccionSelect({
  value = {},
  onChange,
  error,
}: DireccionSelectProps) {
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [ciudades, setCiudades] = useState<string[]>([]);
  const [loadingDeptos, setLoadingDeptos] = useState(true);
  const [loadingCiudades, setLoadingCiudades] = useState(false);

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  useEffect(() => {
    if (value.departamento) {
      fetchCiudades(value.departamento);
    } else {
      setCiudades([]);
      onChange({ ...value, ciudad: undefined });
    }
  }, [value.departamento]);

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch("/api/paraguay/departamentos");
      const data = await response.json();
      setDepartamentos(data);
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
    } finally {
      setLoadingDeptos(false);
    }
  };

  const fetchCiudades = async (departamento: string) => {
    setLoadingCiudades(true);
    try {
      const response = await fetch(
        `/api/paraguay/ciudades?departamento=${encodeURIComponent(departamento)}`
      );
      const data = await response.json();
      setCiudades(data);
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
    } finally {
      setLoadingCiudades(false);
    }
  };

  const departamentoOptions = departamentos.map((depto) => ({
    value: depto,
    label: depto,
  }));

  const ciudadOptions = ciudades.map((ciudad) => ({
    value: ciudad,
    label: ciudad,
  }));

  const customStyles = {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: "hsl(var(--background))",
      borderColor: error
        ? "hsl(var(--destructive))"
        : state.isFocused
          ? "hsl(var(--ring))"
          : "hsl(var(--input))",
      boxShadow: state.isFocused
        ? "0 0 0 1px hsl(var(--ring))"
        : "none",
      borderRadius: "0.375rem",
      minHeight: "2.5rem",
      "&:hover": {
        borderColor: error ? "hsl(var(--destructive))" : "hsl(var(--ring))",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "hsl(var(--primary))"
        : state.isFocused
          ? "hsl(var(--accent))"
          : "transparent",
      color: state.isSelected
        ? "hsl(var(--primary-foreground))"
        : "hsl(var(--foreground))",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "hsl(var(--foreground))",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    loadingIndicator: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    dropdownIndicator: (base: any) => ({
      ...base,
      color: "hsl(var(--muted-foreground))",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "0.375rem",
      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    }),
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-2">
          Departamento
        </label>
        <Select
          options={departamentoOptions}
          value={
            value.departamento
              ? { value: value.departamento, label: value.departamento }
              : null
          }
          onChange={(option) =>
            onChange({
              departamento: option?.value,
              ciudad: undefined,
              barrio: value.barrio,
            })
          }
          placeholder="Seleccione un departamento"
          isLoading={loadingDeptos}
          isClearable
          styles={customStyles}
        />
        {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Ciudad
        </label>
        <Select
          options={ciudadOptions}
          value={
            value.ciudad
              ? { value: value.ciudad, label: value.ciudad }
              : null
          }
          onChange={(option) =>
            onChange({
              ...value,
              ciudad: option?.value,
            })
          }
          placeholder="Seleccione una ciudad"
          isLoading={loadingCiudades}
          isDisabled={!value.departamento}
          isClearable
          styles={customStyles}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Barrio / Calles / Referencias
        </label>
        <input
          type="text"
          value={value.barrio || ""}
          onChange={(e) =>
            onChange({
              ...value,
              barrio: e.target.value,
            })
          }
          placeholder="Ej: Barrio Centro, Calle Principal 123"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}

