class BotonCargar {

    divCarga;
    btnCargar;

    idIntervalo;
    carga;

    velCarga = 0.1; //Velocidad de carga

    /**
     * Crear una vista para poder determinar una carga.
     * Cada vez que se da click en el botón, se invoca a la función onCarga(), pasándole la carga obtenida
     * 
     * @param {Array} vistas Vistas del componente. Debe contener un div (a manera de barra de progreso) y un botón en ese orden
     * @param {function} onCarga Acción a realizar cuando se determine una carga
     */
    constructor(vistas, onCarga) {
        this.carga = 0;
        this.divCarga = vistas[0];
        this.btnCargar = vistas[1];

        this.btnCargar.disabled = true;
        this.btnCargar.addEventListener('click', () => { //Al dar click en el botón
            this.carga = (Math.ceil(this.carga * 10)) / 10; //Calcular la carga redondeada

            onCarga(this.carga); //Enviar el evento

            this.pausar(); //Pausar la vista
        });
    }

    /**
     * Iniciar el movimiento de las vistas para la carga, así como activar el botón
     */
    iniciar() {
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

        this.divCarga.style.height = (this.carga * 100) + "%"; //Actualizar la altura de la carga
        this.divCarga.style.top = ((1 - this.carga) * 100) + "%"; //Actualizar la posición de la carga
    }

}
