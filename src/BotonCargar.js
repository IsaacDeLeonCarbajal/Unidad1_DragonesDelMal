class BotonCargar {

    divContenedor;
    divCarga;
    btnCargar;

    idIntervalo;
    carga;

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
            this.carga = (Math.ceil(this.carga * 10)) / 10;

            onCarga(this.carga); //Enviar el evento

            this.pausar(); //Pausar la vista
        });

        this.divContenedor.insertAdjacentElement("beforeend", this.divCarga);
        this.divContenedor.insertAdjacentElement("beforeend", this.btnCargar);
        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.divContenedor);
    }

    iniciar() {
        this.btnCargar.classList = "btn-cargar btn-cargar-hover";
        clearInterval(this.idIntervalo); //Eliminar el proceso anterior, en caso de que lo hubiera
        this.carga = 0; //Reiniciar la carga
        let dY = 0.1; //Velocidad de carga

        this.idIntervalo = setInterval(() => {
            if ((this.carga + dY) > 1) { //Si la carga es mayor que 1
                this.carga = -dY; //Reiniciarla
            }

            this.setCarga(this.carga += dY);
        }, 70);

        this.btnCargar.disabled = false; //Activar el botón
    }

    pausar() {
        this.btnCargar.classList = "btn-cargar";
        clearInterval(this.idIntervalo);

        this.btnCargar.disabled = true; //Desactivar el botón
    }

    setCarga(nuevaCarga) {
        this.carga = nuevaCarga;

        this.divCarga.style.height = (90 * (this.carga)) + "%"; //Actualizar la altura de la carga
        this.divCarga.style.top = (90 * (1 - this.carga)) + "%"; //Actualizar la posición de la carga
    }

}
