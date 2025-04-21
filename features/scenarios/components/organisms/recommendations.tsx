export const Recommendations = () => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Recomendaciones:
      </h3>
      <div className="text-gray-600 text-sm space-y-4 max-h-64 overflow-y-auto pr-2 pt-2">
        {/* Título principal */}
        <h4 className="uppercase font-semibold">Compromiso</h4>
        <p>
          Por medio de esta acta acepto y me comprometo a cumplir las
          condiciones de acceso y uso a los escenarios deportivos del Instituto
          de la Juventud, el Deporte y la Recreación de Bucaramanga.
        </p>

        {/* Sección de prohibiciones en lista */}
        <h4 className="font-semibold">El INDERBU prohíbe:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Ingresar alimentos y bebidas alcohólicas.</li>
          <li>Ingresar y manipular pólvora.</li>
          <li>Ingresar mascotas.</li>
          <li>
            Ingresar sustancias químicas combustibles (gasolina, ACPM, etc.).
          </li>
          <li>Ingresar armas blancas, de fuego o traumáticas.</li>
          <li>Extraer equipos e implementos sin autorización.</li>
          <li>Fumar, empujar o usar palabras groseras.</li>
          <li>
            Cualquier comportamiento que ponga en riesgo la integridad de los
            visitantes.
          </li>
          <li>Ingresar personas no autorizadas.</li>
          <li>Usar anillos, cadenas u otro metal durante la actividad.</li>
          <li>Consumir sustancias psicoactivas y alcohólicas.</li>
        </ul>

        {/* Párrafo de tarifa */}
        <p>
          A partir del <strong>15 de marzo de 2022</strong>, todo club o persona
          natural que usufructúe los escenarios deportivos deberá cancelar el
          valor del alquiler de acuerdo a la intensidad horaria solicitada
          (Acuerdo 004 – 2022).
        </p>

        {/* Exención de responsabilidad */}
        <h4 className="font-semibold">Exención de responsabilidad</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>
            El INDERBU no se hace responsable de casos de violencia, lesiones o
            muerte causadas por riñas.
          </li>
          <li>
            Se exime de responsabilidad por accidentes inherentes al ejercicio
            de actividades recreo-deportivas.
          </li>
          <li>
            No se responsabiliza por daños a bienes muebles de los solicitantes.
          </li>
          <li>
            Puede cancelar la reserva por imprevistos internos de la entidad.
          </li>
        </ul>

        {/* Párrafos finales */}
        <p>
          El titular de la reserva debe estar presente durante todo el tiempo de
          la misma.
        </p>
        <p>
          Para el ingreso es obligatorio registrarse; los menores deben estar
          acompañados por al menos un adulto responsable.
        </p>

        {/* Nota */}
        <p className="italic text-gray-500">
          Nota: El presente compromiso se entenderá perfeccionado una vez el
          peticionario acepte las condiciones y restricciones aquí plasmadas. La
          reserva quedará en firme.
        </p>
      </div>
    </div>
  );
};
