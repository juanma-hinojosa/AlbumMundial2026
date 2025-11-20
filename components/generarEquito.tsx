function generarEquipo(nombrePais: string, codigoISO: String) {
  const jugadores = [];
  for (let i = 1; i <= 19; i++) {
    jugadores.push({
      id: `${codigoISO}${i}`,
      cantidad: 0
    });
  }
  return { [nombrePais]: jugadores };
}

// Ejemplo de uso para agregar a Brasil y Francia:
const mundial2026 = [
  generarEquipo("Argentina", "ARG"),
  generarEquipo("Estados Unidos", "USA"),
  generarEquipo("Mexico", "MEX"),
  generarEquipo("Canada", "CAN"),
  generarEquipo("Brasil", "BRA"), // Agregado fácil
  generarEquipo("Francia", "FRA") // Agregado fácil
];

console.log(JSON.stringify(mundial2026, null, 2));