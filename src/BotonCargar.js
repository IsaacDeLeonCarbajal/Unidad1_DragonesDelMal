class BotonCargar {

    divContenedor;
    divCarga;
    btnCargar;

    idIntervalo;
    carga;

    constructor(idDivPadre, x, y, width, height, onCarga) {
        this.carga = 0;
        this.divContenedor = document.createElement("div");
        this.divContenedor.style.backgroundColor = "red";
        this.divContenedor.style.position = "absolute";
        this.divContenedor.style.width = width + "%";
        this.divContenedor.style.height = height + "%";
        this.divContenedor.style.left = x + "%";
        this.divContenedor.style.top = y + "%";

        this.divCarga = document.createElement("div");
        this.divCarga.style.backgroundColor = "blue";
        this.divCarga.style.position = "relative";
        this.divCarga.style.width = "100%";
        this.divCarga.style.height = "90%";

        this.btnCargar = document.createElement("button");
        this.btnCargar.style.backgroundColor = "green";
        this.btnCargar.style.position = "absolute";
        this.btnCargar.style.width = "100%";
        this.btnCargar.style.height = "10%";
        this.btnCargar.style.left = "0%";
        this.btnCargar.style.top = "90%";

        this.divContenedor.insertAdjacentElement("beforeend", this.divCarga);
        this.divContenedor.insertAdjacentElement("beforeend", this.btnCargar);

        this.btnCargar.addEventListener('click', () => {
            onCarga();

            this.pausar();
        });

        document.getElementById(idDivPadre).insertAdjacentElement("beforeend", this.divContenedor);
    }

    iniciar() {
        let dY = 0.1; //Velocidad de levitación
        let lim = 1; //Límite de movimiento con la levitación

        this.idIntervalo = setInterval(() => { //Dar el efecto de levitación
            if (((this.carga + dY) > lim) || ((this.carga + dY) < 0)) { //Si se sale de los límites
                dY *= -1; //Moverse en la dirección opuesta
            }

            this.divCarga.style.height = (90 * (this.carga += dY)) + "%"; //Actualizar la altura de la carga
            this.divCarga.style.top = (90 * (1 - this.carga)) + "%"; //Actualizar la posición de la carga
        }, 50);

        this.btnCargar.disabled = false;
    }

    pausar() {
        clearInterval(this.idIntervalo);

        this.btnCargar.disabled = true;
    }

}
