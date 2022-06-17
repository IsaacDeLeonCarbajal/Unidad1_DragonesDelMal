class Dragon {

    static WIDTH = 15;
    static HEIGHT = 20;
    static INDICADOR_WIDTH = 18;
    static HABILIDADES = [
        "Paralización",
        "Multiataque",
        "Curación",
        "Envenenamiento",
        "Superataque",
        "Escudo",
        "Espinas",
        "Debilitamiento"
    ];

    imagen;
    indicadorVida;
    indicadorEfectos;
    indicadorSuper;

    vivo = true;
    danio = 20; //Daño por defecto
    vida = 100;
    super = 100;
    idHabilidad;

    efectos = [];

    idIntervalo;

    constructor(idDivPadre, idDragon, x, y) {
        //Construir el botón que será la imágen del dragón
        this.imagen = document.createElement("button");
        this.imagen.classList = "btn-dragon btn-dragon-activado";
        this.imagen.style.backgroundImage = "url(res/dragon" + (idDragon + 1) + ".png)";
        this.imagen.style.width = Dragon.WIDTH + "%";
        this.imagen.style.height = Dragon.HEIGHT + "%";
        this.imagen.style.left = x + "%";
        this.imagen.style.top = y + "%";

        this.idHabilidad = idDragon; //Hailidad de este dragón

        if (this.idHabilidad < 0 || this.idHabilidad > Dragon.HABILIDADES.length) { //Si la habilidad no es válida
            throw "idDragon inválido. Debe estar entre 1 y " + Dragon.HABILIDADES.length; //Terminar
        }

        let dX = 0.5; //Velocidad de levitación
        let lim = 0.8; //Límite de movimiento con la levitación
        let rX = 0;

        this.idIntervalo = setInterval(() => { //Dar el efecto de levitación
            if (!this.vivo) { //Si el dragón ya fue abatido
                this.imagen.style.left = x + "%"; //Centrar la imagen
                clearInterval(this.idIntervalo); //Dejar de mover la imagen

                return; //No hacer nada más
            }

            if ((rX > lim) || (rX < -lim)) { //Si se sale de los límites
                dX *= -1; //Moverse en la dirección opuesta
            }

            this.imagen.style.left = (x + (rX += dX)) + "%"; //Actualizar la posición de la imagen
        }, 200);

        //Construir el indicador de la vida
        this.indicadorVida = document.createElement("div");
        this.indicadorVida.classList = "div-indicador-vida";
        this.indicadorVida.style.height = "3%";
        this.indicadorVida.style.width = Dragon.WIDTH + "%";
        this.indicadorVida.style.top = (y + Dragon.HEIGHT + 1) + "%";
        this.indicadorVida.style.left = x + "%";

        //Construir el indicador de la carga del super
        this.indicadorSuper = document.createElement("div");
        this.indicadorSuper.classList = "div-indicador-super";
        this.indicadorSuper.innerHTML = Dragon.HABILIDADES[idDragon];
        this.indicadorSuper.style.height = "3%";
        this.indicadorSuper.style.width = "0%";
        this.indicadorSuper.style.top = (y + Dragon.HEIGHT + 4) + "%";
        this.indicadorSuper.style.left = x + "%";

        //Construir el indicador de efectos
        this.indicadorEfectos = document.createElement("div");
        this.indicadorEfectos.classList = "div-indicador-efectos";
        this.indicadorEfectos.style.height = Dragon.HEIGHT + "%";
        this.indicadorEfectos.style.width = Dragon.INDICADOR_WIDTH + "%";
        this.indicadorEfectos.style.top = y + "%";
        this.indicadorEfectos.style.left = x + "%";

        //Construir el botón para activar el super
        this.btnSuper = document.createElement("button");
        this.btnSuper.classList = "btn-super btn-super-desactivado";
        this.btnSuper.innerHTML = "Super";
        this.btnSuper.style.width = "5%";
        this.btnSuper.style.height = "4%";
        this.btnSuper.style.top = (y + Dragon.HEIGHT + 2) + "%";
        this.btnSuper.style.left = x + "%";
        this.btnSuper.addEventListener('click', () => {
            if (this.super < 100) { //Si aún no se carag el super
                Jugador.USAR_SUPER = false; //No se puede activar el super
                return; //No hacer nada más
            }

            Jugador.USAR_SUPER = !Jugador.USAR_SUPER; //Activar o desactivar el super

            if (Jugador.USAR_SUPER) { //Actualizar el estilo CSS del botón, según el estado del super
                this.btnSuper.classList = "btn-super btn-super-activado";
            } else {
                this.btnSuper.classList = "btn-super btn-super-desactivado";
            }
        });

        //Mostrar en pantalla todas las vistas
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.imagen);
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.indicadorVida);
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.indicadorSuper);
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.indicadorEfectos);
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.btnSuper);
    }

    /**
     * Atacar a un dragón oponente con el nivel de fuerza indicado
     * 
     * @param {Dragon} objetivo Dragon al que se va a atacar
     * @param {number} fuerza Nivel de intensidad del ataque
     */
    atacar(objetivo, fuerza) {
        let indiceEfecto = this.efectos.indexOf(7); //Buscar el efecto de debilitamiento

        if (indiceEfecto != -1) { //Si el dragón tiene el efecto de debilitamiento
            fuerza *= 0.7; //Disminuir la fuerza

            this.efectos.splice(indiceEfecto, 1); //Eliminar el efecto
        }

        let danioReal = this.danio * fuerza; //Calcular el daño real, según la fuerza establecida

        this.super = Math.min(this.super + (fuerza * (100)), 100); //Actualizar la carga del super

        this.indicadorSuper.style.width = Math.max(0, (Dragon.WIDTH * this.super * 0.01)) + "%"; //Actualizar el indicador de super

        indiceEfecto = objetivo.efectos.indexOf(5); //Buscar el efecto de escudo en el enemigo

        if (indiceEfecto == -1) { //Si el enemigo no tiene escudo
            objetivo.recibirDanio(danioReal); //Causar el daño en el objetivo
        } else { //Si tiene escudo
            objetivo.efectos.splice(indiceEfecto, 1); //Eliminar el efecto sin hacer daño
        }

        indiceEfecto = objetivo.efectos.indexOf(6); //Buscar el efecto de espinas en el enemigo

        if (indiceEfecto != -1) { //Si el enemigo tiene espinas
            this.recibirDanio(danioReal); //Devolver el daño

            objetivo.efectos.splice(indiceEfecto, 1); //Eliminar el efecto
        }
    }

    usarHabilidad(objetivos, indice) {
        switch (this.idHabilidad) {
            case 0: //paralizacion
                objetivos[indice].efectos.push(this.idHabilidad);
                break;
            case 1: //multiataque
                for (let i = 0; i < objetivos.length; i++) { //Para todos los oponentes
                    objetivos[i].recibirDanio(this.danio * 0.8); //Hacer daño
                }
                break;
            case 2: //curacion
                objetivos[indice].recibirDanio(-20); //Recibir 20 de vida y actualizar el indicador
                break;
            case 3: //envenenamiento
                //Causar el efecto por 3 turnos
                objetivos[indice].efectos.push(this.idHabilidad);
                objetivos[indice].efectos.push(this.idHabilidad);
                objetivos[indice].efectos.push(this.idHabilidad);
                break;
            case 4: //superataque
                objetivos[indice].recibirDanio(this.danio * 1.7); //Hacer daño extra
                break;
            case 5: //escudo
                //Causar el efecto por 2 turnos
                objetivos[indice].efectos.push(this.idHabilidad);
                objetivos[indice].efectos.push(this.idHabilidad);
                break;
            case 6: //espinas
                //Causar el efecto por 3 turnos
                objetivos[indice].efectos.push(this.idHabilidad);
                objetivos[indice].efectos.push(this.idHabilidad);
                objetivos[indice].efectos.push(this.idHabilidad);
                break;
            case 7: //debilitamiento
                //Causar el efecto por 2 turnos
                objetivos[indice].efectos.push(this.idHabilidad);
                objetivos[indice].efectos.push(this.idHabilidad);
                break;
            default:
                throw "idDragon inválido. Debe estar entre 0 y " + (Dragon.HABILIDADES.length - 1);
        }
    }

    pasarTurno() {
        let cantEfectos = {
            "efecto0": 0,
            "efecto1": 0,
            "efecto2": 0,
            "efecto3": 0,
            "efecto4": 0,
            "efecto5": 0,
            "efecto6": 0,
            "efecto7": 0
        };

        for (let i = 0; i < this.efectos.length; i++) {
            cantEfectos["efecto" + this.efectos[i]]++; //Contar los turnos restantes con cada efecto
        }

        this.indicadorEfectos.innerHTML = ""; //Borrar todos los efectos

        for (let i = 0; i < Dragon.HABILIDADES.length; i++) {
            if (cantEfectos["efecto" + i] > 0) { //Si tiene este efecto
                let clase = ""; //Determinar su clase CSS, dependiendo de si es positivo o negativo

                switch (i) {
                    case 2: //curacion
                        clase = "lbl-efecto-positivo";
                        break;
                    case 5: //escudo
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-positivo";
                        break;
                    case 6: //espinas
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-positivo";
                        break;
                    case 0: //paralizacion
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-negativo";
                        break;
                    case 3: //envenenamiento
                        this.recibirDanio(10); //Recibir el daño por envenenamiento
                        clase = "lbl-efecto-negativo";
                        break;
                    case 7: //debilitamiento
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-negativo";
                        break;
                    case 1: //multiataque
                    case 4: //superataque
                        //No hacer nada
                        break;
                    default:
                        throw "idDragon inválido. Debe estar entre 0 y " + (Dragon.HABILIDADES.length - 1);
                }

                this.efectos.splice(this.efectos.indexOf(Dragon.HABILIDADES[i]), 1); //Eliminar un turno del efecto

                this.indicadorEfectos.innerHTML += "<label class='lbl-efecto " + clase + "'>" + Dragon.HABILIDADES[i] + " x " + cantEfectos["efecto" + i] + "</label><br>"; //Agregar el efecto al indicador
            }
        }

        this.btnSuper.classList = "btn-super btn-super-desactivado"; //Reiniciar el botón de super
        this.btnSuper.disabled = true; //Desactivar el botón de super
    }

    recibirDanio(danio) {
        this.vida -= danio; //Disminuir la vida

        this.indicadorVida.style.width = Math.max(0, (Dragon.WIDTH * this.vida * 0.01)) + "%"; //Actualizar el indicador de vida

        if (this.vida <= 0) { //Si el dragon muere
            this.imagen.classList = "btn-dragon btn-dragon-muerto"; //Evitar el efecto hover de CSS
            this.imagen.disabled = true; //Evitar que se pueda seleccionar
            this.vivo = false; //Indicar que ya fue abatido
        }
    }

    /*
    switch (this.idHabilidad) {
        case 0: //paralizacion
            break;
        case 1: //multiataque
            break;
        case 2: //curacion
            break;
        case 3: //envenenamiento
            break;
        case 4: //superataque
            break;
        case 5: //escudo
            break;
        case 6: //espinas
            break;
        case 7: //debilitamiento
            break;
        default:
            throw "idDragon inválido. Debe estar entre 1 y " + Dragon.HABILIDADES.length;
    }
    */

}
