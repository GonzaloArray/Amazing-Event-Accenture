const { createApp } = Vue

createApp({
    data() {
        return {
            eventos: [],
            eventosPast: [],
            eventosUpcoming: [],
            backup: [],
            cesta: [],
            search: "",
            currentDate: "",
            dataForm: {
                name: "",
                email: "",
                text: ""
            },
            url: 'https://amazing-events.herokuapp.com/api/events',
            roles: [],
            rolesBuscados: [],
            imgNoResult: './img/notFound.svg',
            imgNoResultHTML: '../img/notFound.svg',
            event: {},
            estadisticas: {
                evento1: {},
                evento2: {},
                evento3: {},
                estadisticasUpcoming: [],
                estadisticasPast: [],
            },
            error: "",
        }
    },
    /* Esto se ejecuta en el momento que estamos creando */
    created() {
        this.traerDatos();
        if (JSON.parse(localStorage.getItem('event'))) {
            this.cesta = JSON.parse(localStorage.getItem('event'));
        }
    },
    /* Cuando ya se cargo la pagina mounted se va a cargar es igual en js addeventlisterner(load) */
    mounted() {
    },
    methods: {
        traerDatos() {
            fetch(this.url).then(response => response.json())
                .then(data => {
                    this.eventos = data.events;

                    this.eventosPast = this.eventos.filter(event => event.date < data.currentDate);

                    this.eventosUpcoming = this.eventos.filter(event => event.date > data.currentDate);
                    this.currentDate = data.currentDate;

                    this.eventos.forEach(event => {
                        if (!this.roles.includes(event.category)) {
                            this.roles.push(event.category)
                        }
                    });

                    this.backup = this.eventos;
                    this.backupPast = this.eventosPast;
                    this.backupUpcoming = this.eventosUpcoming;

                    // details
                    let id = new URLSearchParams(location.search).get('id');
                    this.event = this.eventos.find(element => element._id === id);

                    // First Table
                    this.estadisticas.evento1 = this.eventosPast.map(element => {
                        return {
                            valor: ((element.assistance / element.capacity * 100)),
                            name: element.name,
                            capacity: element.capacity,
                            image: element.image
                        }
                    }).sort((a, b) => (a.valor - b.valor)).slice(0, 1);

                    // Second Table
                    this.estadisticas.evento2 = this.eventosPast.map(element => {
                        return {
                            valor: ((element.assistance / element.capacity * 100)),
                            name: element.name,
                            capacity: element.capacity,
                            image: element.image
                        }
                    }).sort((a, b) => (a.valor - b.valor)).slice(-1);

                    // Last Table
                    this.estadisticas.evento3 = this.eventosUpcoming.map(element => {
                        return {
                            valor: ((element.estimate / element.capacity * 100)),
                            name: element.name,
                            capacity: element.capacity,
                            image: element.image,
                            asistencia: element.estimate
                        }
                    }).sort((a, b) => (a.asistencia - b.asistencia)).slice(-1);

                    // Upcoming
                    this.estadisticas.estadisticasUpcoming = Object.values(this.eventosUpcoming.reduce((acc, value) => {

                        acc[value.category] = acc[value.category] || {
                            categoria: value.category,
                            valorEstimado: 0,
                            porcentage: 0,
                            longitud: 0
                        };

                        //Sumas el respectivo valor
                        acc[value.category].valorEstimado += value.price * value.estimate;
                        acc[value.category].porcentage += (100 * parseInt(value.estimate) / parseInt(value.capacity))
                        acc[value.category].longitud += 1 * 100
                        return acc; //retornas el nuevo acumulado
                    }, {}));

                    // Past event
                    this.estadisticas.estadisticasPast = Object.values(this.eventosPast.reduce((acc, value) => {

                        acc[value.category] = acc[value.category] || {
                            categoria: value.category,
                            valorEstimado: 0,
                            porcentage: 0,
                            longitud: 0,
                            date: value.date

                        };

                        //Sumas el respectivo valor
                        acc[value.category].valorEstimado += value.price * parseInt(value.assistance);
                        acc[value.category].porcentage += (100 * parseInt(value.assistance) / parseInt(value.capacity))
                        acc[value.category].longitud += 1 * 100
                        return acc; //retornas el nuevo acumulado
                    }, {}))
                })
                .catch(() => {
                    this.error = "There was an error, please try again later";
                })
        },
        enviarFormulario(e) {
            e.preventDefault();

            if (this.dataForm.name !== '') {
                Swal.fire(
                    'Your message was successfully sent!',
                    'You clicked the button!',
                    'success'
                )

                this.dataForm = {
                    name: "",
                    email: "",
                    text: ""
                }
            }
        },
        agregarCesta(curso) {

            let prodExistente;
            let exitente = this.cesta.filter((item, index) => {
                if (item.curso._id == curso._id) {
                    prodExistente = index;

                    return true;
                } else {
                    return false;
                }
            });

            if (exitente.length) {
                this.cesta[prodExistente].cant++;
                localStorage.setItem('event', JSON.stringify(this.cesta));
                return;
            } else {
                this.cesta.push({ curso: curso, cant: 1 })
                localStorage.setItem('event', JSON.stringify(this.cesta));
                return;
            }
        },
        quitarCesta(curso) {
            const valor = this.cesta.filter(element => {
                if (element.curso._id == curso && element.cant >= 1) {
                    element.cant--;
                }
                return element;
            }).filter(element2 => element2.cant >= 1);

            this.cesta = valor;
            localStorage.setItem('event', JSON.stringify(this.cesta));
        }
    },
    computed: {
        superFiltro() {
            let filtro1 = this.backup.filter(event => event.name.toLowerCase().includes(this.search.toLowerCase()));
            // Upcoming
            let filtro1upcoming = this.backupUpcoming.filter(event => event.name.toLowerCase().includes(this.search.toLowerCase()));
            // Past
            let filtro1past = this.backupPast.filter(event => event.name.toLowerCase().includes(this.search.toLowerCase()));

            let filtro2 = filtro1.filter(event => this.rolesBuscados.includes(event.category));

            let filtro2upcoming = filtro1upcoming.filter(event => this.rolesBuscados.includes(event.category));

            let filtro2past = filtro1past.filter(event => this.rolesBuscados.includes(event.category));

            if (filtro2.length > 0 || filtro2past.length > 0 || filtro2upcoming.length > 0) {
                this.eventos = filtro2;
                this.eventosUpcoming = filtro2upcoming;
                this.eventosPast = filtro2past;
            } else {
                this.eventos = filtro1;
                this.eventosUpcoming = filtro1upcoming;
                this.eventosPast = filtro1past;
            }
        },
        cestaTotal: function () {
            let suma = 0;
            for (key in this.cesta) {
                suma = suma + (this.cesta[key].curso.price * this.cesta[key].cant);
            }
            return suma;
        },
        cantTotal: function () {
            let cant = 0;
            for (key in this.cesta) {
                cant = cant + this.cesta[key].cant;
            }
            return cant;
        }
    }
}).mount('#app')