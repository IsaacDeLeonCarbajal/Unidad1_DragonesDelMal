class BotonCargar {

    divContenedor;
    divCarga;
    btnCargar;

    idIntervalo;
    carga;

    velCarga = 0.1; //Velocidad de carga

    /**
     * Crear una vista para poder determinar una carga.
     * Cada vez que se da click en el botón, se invoca a la función onCarga(), pasándole la carga obtenida
     * 
     * @param {String} idDivPadre Atributo id del elemento html que contendrá a esta vista
     * @param {number} x Posición de la vista en el eje x
     * @param {number} y Posición de la vista en el eje y
     * @param {number} width Ancho de la vista
     * @param {number} height Altura total de la vista
     * @param {function} onCarga Acción a realizar cuando se determine una carga
     */
    constructor(idDivPadre, x, y, width, height, onCarga) {
        this.carga = 0;
        this.divContenedor = document.createElement("div");
        this.divContenedor.classList = "div-contenedor";
        this.divContenedor.style.width = width + "%";
        this.divContenedor.style.height = height + "%";
        this.divContenedor.style.left = x + "%";
        this.divContenedor.style.top = y + "%";
        this.divContenedor.style.display = "none";

        this.divCarga = document.createElement("div");
        this.divCarga.classList = "div-carga";
        this.divCarga.style.width = "100%";
        this.divCarga.style.height = "90%";

        this.btnCargar = document.createElement("button");
        this.btnCargar.classList = "btn-cargar";
        this.btnCargar.style.width = "100%";
        this.btnCargar.style.height = "10%";
        this.btnCargar.style.left = "0%";
        this.btnCargar.style.top = "90%";

        this.btnCargar.addEventListener('click', () => { //Al dar click en el botón
            this.carga = (Math.ceil(this.carga * 10)) / 10; //Calcular la carga redondeada

            onCarga(this.carga); //Enviar el evento

            this.pausar(); //Pausar la vista
        });

        //Agregar los elementos a la pantalla
        this.divContenedor.insertAdjacentElement("beforeend", this.divCarga);
        this.divContenedor.insertAdjacentElement("beforeend", this.btnCargar);
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.divContenedor);
    }

    /**
     * Iniciar el movimiento de las vistas para la carga, así como activar el botón
     */
    iniciar() {
        this.btnCargar.classList = "btn-cargar btn-cargar-hover"; //Actualizar el estilo del boton
        clearInterval(this.idIntervalo); //Eliminar el proceso anterior, en caso de que lo hubiera
        this.carga = 0; //Reiniciar la carga
        this.btnCargar.disabled = false; //Activar el botón

        this.idIntervalo = setInterval(() => {
            if ((this.carga + this.velCarga) > 1) { //Si la carga es mayor que 1
                this.carga = -this.velCarga; //Reiniciarla
            }

            this.setCarga(this.carga += this.velCarga); //Actualizar la carga
        }, 70);
    }

    /**
     * Pausar el movimiento de las vistas para la carga, así como desactivar el botón
     */
    pausar() {
        this.btnCargar.classList = "btn-cargar"; //Actualizar el estilo del boton
        clearInterval(this.idIntervalo); //Eliminar el proceso anterior, en caso de que lo hubiera

        this.btnCargar.disabled = true; //Desactivar el botón
    }

    /**
     * Cambiar el nivel de la carga y actualizar la vista del indicador
     * 
     * @param {number} nuevaCarga La carga a la que se va a actualizar. Debe ser un número entre 0 y 1
     */
    setCarga(nuevaCarga) {
        this.carga = nuevaCarga;

        this.divCarga.style.height = (90 * (this.carga)) + "%"; //Actualizar la altura de la carga
        this.divCarga.style.top = (90 * (1 - this.carga)) + "%"; //Actualizar la posición de la carga
    }

}
