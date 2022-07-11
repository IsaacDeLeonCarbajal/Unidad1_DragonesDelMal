class Jugador {

    static DRAGON_EN_TURNO = null;
    static USAR_SUPER = false;

    dragones = []; //Dragones de este jugador
    numJugador = 0;

    jugOponente;
    indiceTurno = -1;

    carga = undefined;

    /**
     * Crear a un jugador, el cual contendrá a sus dragones y maneja la realización de los turnos
     * 
     * @param {String} idDivPadre Atributo id del elemento html que contendrá a estas vistas
     * @param {Array} idsDragones Arreglo con los id de los dragones se este jugador
     * @param {number} numJugador Número del jugador, que debe ser uno de 1 y 2
     */
    constructor(idsDragones, numJugador) {
        this.numJugador = numJugador;

        for (let i = 0; i < idsDragones.length; i++) { //Crear las vistas de cada dragón
            let dragon = new Dragon("div-jug-" + numJugador, "tmp-jug-" + numJugador, idsDragones[i],
                (superActivado) => {
                    if (this.carga != undefined) { //Si ya se determinó una carga
                        return; //No se puede usar el super
                    }

                    Jugador.USAR_SUPER = superActivado; //Actualizar el estado del super

                    dragon.btnCargar.setCarga(0); //Reiniciar la vista para determinar la carga

                    if (superActivado) { //Si se activa el super
                        dragon.btnCargar.pausar(); //No se usará la carga
                    } else { //Si se desactiva el super
                        dragon.btnCargar.iniciar(); //Si se usará la carga
                    }
                }, (carga) => {
                    this.carga = carga; //Actualizar la carga
                });

            //Acomodar las vistas del dragón
            dragon.vista.style.transform = "scaleX(" + ((numJugador == 1) ? "-1" : "1") + ")";

            this.dragones.push(dragon); //Agregar el dragón al arreglo
        }
    }

    /**
     * Actualizar la referencia al jugador oponente, para agregar los eventos necesarios para el manejo de los turnos
     * @param {Jugador} jugOponente Enemigo de este jugador
     */
    setJugadorOponente(jugOponente) {
        this.jugOponente = jugOponente; //Actualizar el jugador oponente

        for (let i = 0; i < this.dragones.length; i++) { //Para cada dragón
            this.dragones[i].vista.addEventListener('click', () => { //Al dar click en un dragón
                let esAliado = this.dragones.includes(Jugador.DRAGON_EN_TURNO); //Determinar si el jugador en turno es un aliado

                if (Jugador.USAR_SUPER) { //Si se activó el super
                    switch (Jugador.DRAGON_EN_TURNO.idHabilidad) { //Determinar si el super es positivo o negativo
                        case 2: //curacion
                        case 5: //escudo
                        case 6: //espinas
                            //Efecto positivo
                            if (esAliado) { //Si es un aliado
                                Jugador.DRAGON_EN_TURNO.setSuper(0); //Reiniciar el super

                                Jugador.DRAGON_EN_TURNO.usarHabilidad(this.dragones, i); //El dragón en turno ataca a este dragón
                                this.jugOponente.terminarTurno(); //Dejar el turno al siguiente dragon del mismo jugador
                            } else { //Si es un oponente
                                mostrarAlerta("Cuidado", "Ese dragón es oponente<br>"
                                    + "Utiliza " + Dragon.HABILIDADES[Jugador.DRAGON_EN_TURNO.idHabilidad] + " sobre un dragón aliado"); //Mostrar una alerta

                                return; //No terminar el turno
                            }

                            break;
                        case 0: //paralizacion
                        case 1: //multiataque
                        case 3: //envenenamiento
                        case 4: //superataque
                        case 7: //debilitamiento
                            //Efecto negativo
                            if (!esAliado) { //Si es un oponente
                                Jugador.DRAGON_EN_TURNO.setSuper(0); //Reiniciar el super

                                Jugador.DRAGON_EN_TURNO.usarHabilidad(this.dragones, i); //El dragón en turno ataca a este dragón
                                this.terminarTurno(); //Dejar el turno al siguiente dragon del mismo jugador
                            } else { //Si es un aliado
                                mostrarAlerta("Cuidado", "Ese dragón es aliado<br>"
                                    + "Utiliza " + Dragon.HABILIDADES[Jugador.DRAGON_EN_TURNO.idHabilidad] + " sobre un dragón oponente"); //Mostrar una alerta

                                return; //No terminar el turno
                            }

                            break;
                        default:
                            throw "idDragon inválido. Debe estar entre 0 y " + (Dragon.HABILIDADES.length - 1);
                    }

                    return; //No terminar el turno
                } else { //Si es un ataque normal
                    if (esAliado) { //Si es un dragón aliado
                        mostrarAlerta("Cuidado", "Ese dragón es aliado<br>"
                            + "Ataca sólo a dragones oponentes"); //Mostrar una alerta

                        return; //No terminar el turno
                    } else if (this.jugOponente.carga == undefined) { //Si es un oponente y no se ha establecido una carga
                        mostrarAlerta("Prepara el ataque antes", "Antes de elegir un objetivo, debes determinar la carga de ataque");

                        return; //No terminar el turno
                    } else { //Si es un oponente y ya se tiene una carga
                        Jugador.DRAGON_EN_TURNO.atacar(this.dragones[i], this.jugOponente.carga); //El dragón en turno ataca a este dragón
                    }
                }

                if (!this.tieneDragones()) { //Si después del ataque este jugador ya no tiene otros dragones
                    mostrarAlerta("Ganador", "El ganador es el jugador " + this.jugOponente.numJugador); //El oponente es el ganador
                } else { //Si aún tiene dragones
                    this.jugOponente.terminarTurno(); //Terminar el turno del oponente
                }
            });
        }
    }

    /**
     * Ejecutar un turno del jugador.
     * Actualizar el índice, el dragón en turno, y las vistas necesarias
     * 
     * @param {number} indiceDragon Indice del dragón que debe realizar el turno
     */
    realizarTurno(indiceDragon) {
        if (indiceDragon == this.dragones.length) { //Si el índice del dragón es igual al número de dragones
            indiceDragon = 0; //Reiniciar el índice
        }

        Jugador.DRAGON_EN_TURNO = this.dragones[indiceDragon]; //Actualizar el dragon en turno
        this.indiceTurno = indiceDragon; //Actualizar el índice del dragón en turno

        if (!Jugador.DRAGON_EN_TURNO.vivo) { //Si el dragon ya fue abatido
            this.realizarTurno(indiceDragon + 1); //El turno es del siguiente dragon de este jugador

            return; //No hacer nada más
        } else { //Si el dragon aún está vivo
            let indiceEfecto = Jugador.DRAGON_EN_TURNO.efectos.indexOf(0); //Buscar el efecto de paralización

            if (indiceEfecto != -1) { //Si el dragón tiene el efecto de paralización
                Jugador.DRAGON_EN_TURNO.efectos.splice(indiceEfecto, 1); //Eliminar el efecto

                this.terminarTurno(); //Omitir el turno

                return; //No hacer nada más
            }
        }

        Jugador.DRAGON_EN_TURNO.btnCargar.iniciar(); //Iniciar el botón de cargar
        Jugador.DRAGON_EN_TURNO.btnSuper.disabled = false; //Activar el botón de super del dragón en turno

        for (let i = 0; i < this.dragones.length; i++) { //Para cada dragon
            if (!this.dragones[i].vivo) { //Si el dragon ya fue abatido
                continue; //Ignorar
            }

            if (i == indiceDragon) { //Actualizar el estilo CSS del botón, según si es o no el dragón en turno
                this.dragones[i].vista.classList = "btn-dragon btn-dragon-turno";
            } else {
                this.dragones[i].vista.classList = "btn-dragon btn-dragon-activado";
            }
        }
    }

    /**
     * Terminar el turno del jugador.
     * Actualizar el índice, el dragón en turno, y las vistas necesarias
     */
    terminarTurno() {
        Jugador.USAR_SUPER = false; //Desactivar el super
        this.carga = undefined; //Eliminar la carga

        for (let i = 0; i < this.dragones.length; i++) { //Para los dragones propios
            if (this.dragones[i].vivo) { //Si el dragon sigue vivo
                //Mostrar que puede ser atacado
                this.dragones[i].vista.classList = "btn-dragon btn-dragon-activado";
                this.dragones[i].vista.disabled = false; //Activar el botón para ser atacado
                this.dragones[i].pasarTurno(); //Actualizar los indicadores de efectos
            }
        }

        for (let i = 0; i < this.jugOponente.dragones.length; i++) { //Para los dragones del oponente
            if (this.jugOponente.dragones[i].vivo) { //Si el dragon sigue vivo
                this.jugOponente.dragones[i].pasarTurno(); //Actualizar los indicadores de efectos
            }
        }

        this.jugOponente.realizarTurno(this.jugOponente.indiceTurno + 1); //Realizar el turno del oponente con su siguiente dragón
    }

    /**
     * Indica si este jugador tiene dragones vivos restantes
     * 
     * @returns true si tiene dragones, false si no
     */
    tieneDragones() {
        for (let i = 0; i < this.dragones.length; i++) {
            if (this.dragones[i].vivo) { //Si alguno de los dragones está vivo
                return true; //Aún tiene dragones
            }
        }

        return false; //Si se llega aquí, ya no tiene dragones
    }

}
