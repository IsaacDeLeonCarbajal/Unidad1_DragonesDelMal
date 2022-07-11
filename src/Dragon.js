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

    vista;
    indicadorVida;
    indicadorEfectos;
    indicadorSuper;
    btnSuper;
    btnCargar;

    idHabilidad;
    vivo = true;
    danio = 20;
    vida = 100;
    super = 0;

    efectos = [];
    superActivado = false;

    idIntervalo;

    /**
     * Crear un dragón para el juego.
     * Este contiene a todas las vistas necesarias para su manejo, como la imagen y diversos indicadores.
     * 
     * @param {String} idDivPadre Atributo id del elemento HTML que contendrá a este dragón
     * @param {number} idDragon Id de la clase a la que pertenece este dragón
     * @param {function} onSuperChange Acción a realizar cuando se cambie el estado del super
     * @param {function} onCarga Acción a realizar cuando se determine una carga
     */
    constructor(idDivPadre, idTmpJug, idDragon, onSuperChange, onCarga) {
        let tmpJug = document.getElementById(idTmpJug);
        let div = document.importNode(tmpJug.content.querySelector("div"), true);

        this.vista = div.querySelector("#btn-vista");
        this.btnSuper = div.querySelector("#btn-super");
        this.indicadorVida = div.querySelector("#div-indicador-vida");
        this.indicadorSuper = div.querySelector("#div-indicador-super");
        this.indicadorEfectos = div.querySelector("#div-indicador-efectos");

        div.querySelector("#lbl-nombre").innerHTML = Dragon.HABILIDADES[idDragon];

        this.idHabilidad = idDragon; //Hailidad de este dragón

        if (this.idHabilidad < 0 || this.idHabilidad > Dragon.HABILIDADES.length) { //Si la habilidad no es válida
            throw "idDragon inválido. Debe estar entre 0 y " + (Dragon.HABILIDADES.length - 1);
        }

        let dX = 1.5; //Velocidad de levitación
        let lim = 3; //Límite de movimiento con la levitación
        let rX = 0; //Posición real en x

        this.idIntervalo = setInterval(() => { //Dar el efecto de levitación
            if (!this.vivo) { //Si el dragón ya fue abatido
                this.vista.style.left = "0%"; //Centrar la imagen
                clearInterval(this.idIntervalo); //Dejar de mover la imagen

                return; //No hacer nada más
            }

            if ((rX > lim) || (rX < -lim)) { //Si se sale de los límites
                dX *= -1; //Moverse en la dirección opuesta
            }

            this.vista.style.left = (rX += dX) + "%"; //Actualizar la posición de la imagen
        }, 200);

        this.vista.style.backgroundImage = "url(assets/img/dragon" + (idDragon + 1) + ".png)";

        this.btnCargar = new BotonCargar([div.querySelector("#div-carga"), div.querySelector("#btn-cargar")], onCarga);

        this.btnSuper.disabled = true;
        this.btnSuper.addEventListener('click', () => {
            this.superActivado = !this.superActivado && (this.super >= 100); //Activar o desactivar el super. Si el super no ha llegado a 100, no se puede activar

            onSuperChange(this.superActivado); //Enviar el evento
        });

        document.getElementById(idDivPadre).insertAdjacentElement('beforeend', div); //Agregar la vista a la pantalla
    }

    /**
     * Atacar a un dragón oponente con el nivel de fuerza indicado
     * 
     * @param {Dragon} objetivo Dragon al que se va a atacar
     * @param {number} fuerza Nivel de intensidad del ataque
     * @param {boolean} cargarSuper Indica si se el ataque aumenta la carga del super de este dragón. Por default es true
     */
    atacar(objetivo, fuerza, cargarSuper) {
        let indiceEfecto = this.efectos.indexOf(7); //Buscar el efecto de debilitamiento

        if (indiceEfecto != -1) { //Si el dragón tiene el efecto de debilitamiento
            fuerza *= 0.6; //Disminuir la fuerza

            this.efectos.splice(indiceEfecto, 1); //Eliminar el efecto
        }

        let danioReal = this.danio * fuerza; //Calcular el daño real, según la fuerza establecida

        if (cargarSuper == undefined || cargarSuper !== false) { //Si se debería cargar el super con el ataque
            this.setSuper(Math.min(this.super + (fuerza * (100 / 4)), 100)); //Actualizar la carga del super
        }

        indiceEfecto = objetivo.efectos.indexOf(5); //Buscar el efecto de escudo en el enemigo

        if (indiceEfecto == -1) { //Si el enemigo no tiene escudo
            objetivo.recibirDanio(danioReal); //Causar el daño en el objetivo
        } else { //Si tiene escudo
            objetivo.efectos.splice(indiceEfecto, 1); //Eliminar el efecto sin hacer daño
        }

        indiceEfecto = objetivo.efectos.indexOf(6); //Buscar el efecto de espinas en el enemigo

        if (indiceEfecto != -1) { //Si el enemigo tiene espinas
            this.recibirDanio(danioReal); //Recibir el daño hecho

            objetivo.efectos.splice(indiceEfecto, 1); //Eliminar el efecto
        }
    }

    /**
     * Usar el super de este dragón en contra de otro, según los parámetros proporcionados
     * 
     * @param {Array} objetivos Equipo de dragones al que se le va a dar el efecto del super
     * @param {number} indice Posición del dragón objetivo en el arreglo
     */
    usarHabilidad(objetivos, indice) {
        switch (this.idHabilidad) {
            case 0: //paralizacion
                //Causar el efecto por 1 turno
                objetivos[indice].efectos.push(this.idHabilidad);
                break;
            case 1: //multiataque
                for (let i = 0; i < objetivos.length; i++) { //Para todos los oponentes
                    this.atacar(objetivos[i], 0.8, false); //Hacer daño sin recibir super
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
                this.atacar(objetivos[indice], 2, false); //Hacer daño sin recibir super
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

    /**
     * Procesos que se realizan cada vez que un jugador termina un turno.
     * 
     * Consiste principalmente en el manejo de los efectos que tiene este dragón
     */
    pasarTurno() {
        let cantEfectos = { //Cantidad de turnos restantes con cada efecto que tiene el dragón
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

        this.indicadorEfectos.innerHTML = ""; //Borrar todos los efectos de la vista

        for (let i = 0; i < Dragon.HABILIDADES.length; i++) { //Para cada tipo de efecto
            if (cantEfectos["efecto" + i] > 0) { //Si el dragón tiene este efecto
                let clase = ""; //Determinar su clase CSS, dependiendo de si es positivo o negativo

                /*
                Algunos efectos, como el escudo, se quedan en el dragón hasta que se utilicen.
                Otros, como el envenenamiento, se van usando y quitando del dragón en cada turno.
                */

                switch (i) {
                    case 0: //paralizacion
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-negativo";
                        break;
                    case 1: //multiataque
                        //No hacer nada
                        break;
                    case 2: //curacion
                        //No hacer nada
                        break;
                    case 3: //envenenamiento
                        this.recibirDanio(10); //Recibir el daño por envenenamiento
                        clase = "lbl-efecto-negativo";
                        break;
                    case 4: //superataque
                        //No hacer nada
                        break;
                    case 5: //escudo
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-positivo";
                        break;
                    case 6: //espinas
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-positivo";
                        break;
                    case 7: //debilitamiento
                        this.efectos.push(Dragon.HABILIDADES[i]); //Agregar el efecto que se va a quitar
                        clase = "lbl-efecto-negativo";
                        break;
                    default:
                        throw "idDragon inválido. Debe estar entre 0 y " + (Dragon.HABILIDADES.length - 1);
                }

                this.efectos.splice(this.efectos.indexOf(Dragon.HABILIDADES[i]), 1); //Eliminar un turno del efecto

                this.indicadorEfectos.innerHTML += "<label class='lbl-efecto " + clase + "'>" + Dragon.HABILIDADES[i] + " x " + cantEfectos["efecto" + i] + "</label><br>"; //Agregar el efecto a la vista del indicador
            }
        }

        this.btnSuper.disabled = true; //Desactivar el botón de super
    }

    /**
     * Bajar la vida de este dragón y actualizar los indicadores correspondientes.
     * Actualizar el estado si el dragón es abatido con este ataque
     * 
     * @param {number} danio Cantidad de daño a recibir
     */
    recibirDanio(danio) {
        this.vida -= danio; //Disminuir la vida

        this.indicadorVida.style.width = Math.max(0, this.vida) + "%"; //Actualizar el indicador de vida

        if (this.vida <= 0) { //Si el dragon muere
            this.vista.classList = "btn-dragon btn-dragon-muerto"; //Evitar el efecto hover de CSS
            this.vista.disabled = true; //Evitar que se pueda seleccionar
            this.vivo = false; //Indicar que el dragón ya fue abatido
        }
    }

    /**
     * Actualizar la carga del super y los indicadores correspondientes
     * 
     * @param {number} nuevoSuper Nueva carga del super
     */
    setSuper(nuevoSuper) {
        this.super = nuevoSuper; //Actualizar el super

        this.indicadorSuper.style.width = Math.max(0, this.super) + "%"; //Actualizar el indicador de super
    }

}
