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
      borderColor: error
        ? "#ef4444"
        : state.isFocused
        ? "#1e3a8a"
        : "#cbd5e1",
      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(30, 58, 138, 0.2)"
        : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : "#1e3a8a",
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#1e3a8a"
        : state.isFocused
        ? "#e0e7ff"
        : "white",
      color: state.isSelected ? "white" : "#0a1c2e",
      "&:active": {
        backgroundColor: "#1e3a8a",
        color: "white",
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#0a1c2e",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#64748b",
    }),
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">
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
          className="text-navy-900"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">
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
          className="text-navy-900"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-2">
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
          className="w-full px-4 py-2 border border-navy-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent text-navy-900 placeholder:text-navy-400"
        />
      </div>
    </div>
  );
}

