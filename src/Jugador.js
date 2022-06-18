class Jugador {

    static DRAGON_EN_TURNO = null;
    static USAR_SUPER = false;

    dragones = []; //Dragones de este jugador
    numJugador = 0;

    jugOponente;
    indiceTurno = -1;

    carga = undefined;

    /**
     * 
     * @param {Array} idsDragones Arreglo con los id de los dragones se este jugador
     */
    constructor(idDivPadre, idsDragones, numJugador) {
        this.numJugador = numJugador;

        //Variables para acomodar las vistas, dependiendo si es el jugador de la izquierda o la derecha
        let dragonesX = 0;
        let transform = "";
        let indicadorX = 0;
        let btnSuperX = 0;
        let textAlign = "left";

        switch (numJugador) {
            case 1: //Si es el jugador 1 (a la izquierda)
                dragonesX = 25;
                transform = "scaleX(-1)";
                indicadorX = (dragonesX - Dragon.INDICADOR_WIDTH - 1) + "%";
                btnSuperX = (dragonesX + Dragon.INDICADOR_WIDTH - 2);
                textAlign = "right";
                break;
            case 2: //Si es el jugador 2 (a la derecha)
                dragonesX = 60;
                indicadorX = (dragonesX + Dragon.INDICADOR_WIDTH + 1) + "%";
                btnSuperX = (dragonesX - 6);
                textAlign = "left";
                break;
        }

        for (let i = 0; i < idsDragones.length; i++) { //Crear y acomodar las vistas de cada dragón
            let dragon = new Dragon(idDivPadre, idsDragones[i], dragonesX, 10 + (28 * i), (superActivado) => {
                if (this.carga != undefined) { //Si ya se determinó una carga
                    return; //No se puede usar el super
                }

                Jugador.USAR_SUPER = superActivado; //Actualizar el estado del super

                this.btnCargar.setCarga(0); //Reiniciar la vista para determinar la carga

                if (superActivado) { //Si se activa el super
                    this.btnCargar.pausar(); //No se usará la carga
                } else { //Si se desactiva el super
                    this.btnCargar.iniciar(); //Si se usará la carga
                }
            });
            //Acomodar las vistas del dragón
            dragon.imagen.style.transform = transform;
            dragon.indicadorEfectos.style.left = indicadorX;
            dragon.indicadorEfectos.style.textAlign = textAlign;
            dragon.btnSuper.style.left = btnSuperX + "%";

            this.dragones.push(dragon); //Agregar el dragón al arreglo
        }

        this.btnCargar = new BotonCargar(idDivPadre, btnSuperX + 1, 10, 3, Dragon.HEIGHT, (carga) => {
            this.carga = carga; //Actualizar la carga
        });
    }

    setJugadorOponente(jugOponente) {
        this.jugOponente = jugOponente; //Actualizar el jugador oponente

        for (let i = 0; i < this.dragones.length; i++) { //Para cada dragón
            this.dragones[i].imagen.addEventListener('click', () => { //Al dar click en un dragón
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

        this.btnCargar.divContenedor.style.display = "inline"; //Mostrar el botón de cargar
        this.btnCargar.divContenedor.style.top = (10 + (28 * indiceDragon)) + "%"; //Mover la vista para que esté al lado del dragón en turno
        this.btnCargar.iniciar(); //Iniciar el botón de cargar

        Jugador.DRAGON_EN_TURNO.btnSuper.disabled = false; //Activar el botón de super del dragón en turno

        for (let i = 0; i < this.dragones.length; i++) { //Para cada dragon
            if (!this.dragones[i].vivo) { //Si el dragon ya fue abatido
                continue; //Ignorar
            }

            if (i == indiceDragon) { //Actualizar el estilo CSS del botón, según si es o no el dragón en turno
                this.dragones[i].imagen.classList = "btn-dragon btn-dragon-turno";
            } else {
                this.dragones[i].imagen.classList = "btn-dragon btn-dragon-activado";
            }
        }
    }

    terminarTurno() {
        Jugador.USAR_SUPER = false; //Desactivar el super
        this.carga = undefined; //Eliminar la carga
        this.btnCargar.divContenedor.style.display = "none"; //Ocultar el botón de cargar

        for (let i = 0; i < this.dragones.length; i++) { //Para los dragones propios
            if (this.dragones[i].vivo) { //Si el dragon sigue vivo
                //Mostrar que puede ser atacado
                this.dragones[i].imagen.classList = "btn-dragon btn-dragon-activado";
                this.dragones[i].imagen.disabled = false; //Activar el botón para ser atacado
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

    tieneDragones() {
        for (let i = 0; i < this.dragones.length; i++) {
            if (this.dragones[i].vivo) { //Si alguno de los dragones está vivo
                return true; //Aún tiene dragones
            }
        }

        return false; //Si se llega aquí, ya no tiene dragones
    }

}
