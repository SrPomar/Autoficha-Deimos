/* 
nombre: string
texto: string
icono: string (url)
tipo: "talento" o "arquetipo"
id: string (4 numeros: atributo - habilidad - columna - fila). Los talentos interdisciplinarios son 77xx y los del arquetipo 88xx
prereqs: array [nivel mínimo del arquetipo / habilidad correspondiente, string del talento anterior, string del talento que excluye]
coste: int / string. int para coste de xp / "☆" para mvpp
tooltip: generateTooltip(this)
onBuy: function() {} - se ejecutará al comprar el talento. debería incluir siempre el buyTalent(this) que devuelve true / false y colgar todo lo demás de un if
onClick: function() {} - se ejecutará tras clicar el talento
*/

talentEligibility = (talent) => { //checks if a talent is already bought, available to buy or locked. returns 0, 1 or 2 respectively
    if (personaje.talentos.includes(talent.id)) { // if already bought
        return 0 
    }

    // arquetipo logic
    if (talent.tipo == "arquetipo") {
        if (talent.prereqs[0] <= personaje.talentos[0]) { // min lvl verification
            if (talent.prereqs[1] == undefined || personaje.talentos.includes(talent.prereqs[1])) { // talent verification
                return 1
            }
            else {return 2}
        }
    }

    //regular talent logic
    else if (talent.tipo == "talento") {
        let SumTable = [0, 4, 8, 12, 16, 19, 22]; //Offsets for skills from previous attributes by that amount

        var atributo = parseInt(talent.id[0])
        var skill = parseInt(talent.id[1])
        skill += SumTable[atributo]

        if (atributo == 7) {return 2} // Interdisciplinaries have no prerequisites
        else if (talent.prereqs[0] <= Object.entries(personaje.hab)[skill][1][0]) { //min lvl verification
            if (talent.prereqs[1] == undefined || personaje.talentos.includes(talent.prereqs[1])) { //talent verification
                if (talent.prereqs[2] == undefined || (personaje.talentos.includes(talent.prereqs[2]) == false)) {return 1} //exclusive talent verification
                else {return 2}
            }
        }
        else {return 2}
    }

    
    else {return 1}
}

shareEmbed = (talent) => {
    var embed = {
        title: talent.nombre,
        description: talent.texto,
        thumbnail: {url: talent.icono},
    }
    webhook("", embed)
}

appendArchetype = (int) => {
    let archArray = arquetipos[int]

    let row = document.getElementById("88").insertRow(); //Programatically generated as to save end users the bother
    
    for (i= 0; i < 6; i++) {row.insertCell()}

    for (i = 0; i < archArray.length; i++) {
        talents.push(archArray[i])
    }

    generateButtons()
    buttonUpdater()

    globalFlagGeneratedButtons = true
}

generateButtons = () => {
    for (i=0; i < talents.length; i++) {
        var tabID = talents[i].id.slice(0,2)
        var cellPos = [talents[i].id.slice(3), talents[i].id.slice(2,3)]
        var button = document.getElementById(tabID).rows[cellPos[1]].cells[cellPos[0]].appendChild(document.createElement("img")) //We create the button and add it to the table

        button.setAttribute("id", talents[i].id) // ID
        button.setAttribute("src", talents[i].icono) // IMAGE
        button.setAttribute("onmouseover", "tooltipHandler(talents["+i+"])")
        button.setAttribute("onmouseout", "hideTooltip()")
    }
}

buttonUpdater = () => {
    for (i=0; i < talents.length; i++) {
        var status = talentEligibility(talents[i])
        var button = document.getElementById(talents[i].id)
        if (status == 0) { //already bought
            button.style.border = "6px solid white"
            button.style.borderRadius = "24px"
            button.style.filter = "grayscale(0)"
            button.setAttribute("onclick", "talents["+i+"].onClick()")
        }
        if (status == 1) { //available to buy
            button.style.border = "6px solid green"
            button.style.borderRadius = "24px"
            button.style.filter = "grayscale(0)"
            button.setAttribute("onclick", "talents["+i+"].onBuy()")
        }
        if (status == 2) { //locked
            button.style.filter = "grayscale(1)"
            button.style.border = ""
            button.style.removeProperty("borderRadius")
            button.removeAttribute("onClick")
        }
    }
}

generateArrows = (id) => {
    for (i = 0; i < arrows.length; i++) { // Remove all old arrows
        arrows[i].remove()
    }

    arrows = []

    for (i = 0; i < talents.length; i++) {
        // BASIC PREREQ CHECK
        if (talents[i].prereqs[1] != undefined) {
            if (id == talents[i].prereqs[1].slice(0,2)) {
                let origen = document.getElementById(talents[i].prereqs[1])
                let destino = document.getElementById(talents[i].id)
                let rgb = "grey"

                if (personaje.talentos.includes(talents[i].id)) { //Already bought, line can only be white
                    rgb = "white"
                }

                else if (personaje.talentos.includes(talents[i].prereqs[1])) { // Bought the prereq but not this talent
                    rgb = "green"
                }

                arrows.push(new LeaderLine(origen, destino, {size: 6, color: rgb}))
            } 
        }

        //EXCLUSIVE TALENTS CHECK
        console.log ("performing exclusive check on "+talents[i].nombre)
        if (talents[i].prereqs[2] != undefined) {
            if (id == talents[i].prereqs[2].slice(0,2)) {
                console.log("found an exclusivity! opc1: "+talents[i].id+" opc2: "+talents[i].prereqs[2])
                let opc1 = document.getElementById(talents[i].id) // our target
                let opc2 = document.getElementById(talents[i].prereqs[2]) // the other option

                if (personaje.talentos.includes(talents[i].id)) { // if we have our target
                    arrows.push (new LeaderLine(opc2, opc1, {color: "red", size: 6}))
                }
                else if (personaje.talentos.includes(talents[i].prereqs[2]) == false) { // if we don't have the other option
                    arrows.push (new LeaderLine(opc1, opc2, {color: "yellow", size: 6, dash: true}))
                }
            }
            //The inverse case (we do have the other option) is solved before / after in another iteration of the for loop
        }
    }
}

tooltipHandler = (talent) => {
    var cursor = [event.pageX, event.pageY]
    var tooltip = document.getElementById("tooltip")

    document.getElementById("tth3").innerHTML = talent.nombre
    document.getElementById("ttp").innerHTML = talent.texto
    tooltip.style.left = cursor[0]+"px"
    tooltip.style.top = cursor[1]+"px"
    tooltip.style.display = "inline"
}

hideTooltip = () => {
    document.getElementById("tooltip").style.display = "none"
}


var  talents = [ //INVESTIGACIÓN
    {nombre: "Detective",
    texto: "Puedes elegir entre la jerga policíaca o una especialización de cualquier tipo.",
    icono: "https://i.imgur.com/B2nAqzI.png",
    tipo: "talento",
    id: "0001",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Obsesión",
    texto: "Al concatenar tiradas de investigación sobre un tema determinado, obtienes un éxito adicional por cada tirada anterior.",
    icono: "https://i.imgur.com/lL1sdT5.png",
    tipo: "talento",
    id: "0012",
    coste: 5,
    prereqs: [3],
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Aprendiz eterno",
    texto: "Obtienes un PX adicional tras cada sesión, y otro si ganas la mejor escena.",
    icono: "https://imgur.com/knRcFCb.png",
    tipo: "talento",
    id: "0014",
    coste: 5,
    prereqs: [3],
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Bata de laboratorio",
    texto: "Recibes un punto menos de daño frente a ácidos y venenos.",
    icono: "https://i.imgur.com/a5IgecH.png",
    tipo: "talento",
    id: "0023",
    coste: 5,
    prereqs: [4],
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cazador preparado",
    texto: "Puedes investigar a organizaciones o individuos para descubrir sus vulnerabilidades, lo que te confiere un éxito automático en tus “ataques” contra la organización o dos éxitos contra individuos.",
    icono: "https://i.imgur.com/wmPGTyg.png",
    tipo: "talento",
    id: "0032",
    coste: 5,
    prereqs: [5],
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //CONOCIMIENTO
    {nombre: "Carrera universitaria",
    texto: "Obtienes una especialización académica o técnica a tu elección",
    icono: "https://i.imgur.com/yGGhNF7.png",
    tipo: "talento",
    id: "0101",
    coste: 5,
    prereqs: [2],
    onBuy: function() {
       if(buyTalent(this)){
        addToArray(1); updateView()
       }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Navegante burocrático",
    texto: "Conoces los secretos del formulario 113-B y los horarios indescifrables del ministerio de asuntos internos, con lo que obtienes un éxito automático en tus tiradas para realizar trámites burocráticos",
    icono: "https://i.imgur.com/iu6VZf3.png",
    tipo: "talento",
    id: "0104",
    coste: 5,
    prereqs: [2],
    onBuy: function() {
        buyTalent(this);
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Máster",
    texto: "Obtienes una especialización académica o técnica a tu elección",
    icono: "https://i.imgur.com/E2aMn1P.png",
    tipo: "talento",
    id: "0111",
    coste: 5,
    prereqs: [3],
    onBuy: function() {
        if(buyTalent(this)) {
            addToArray(1);
            updateView()
        }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Académico",
    texto: "Adquieres la jerga académica.",
    icono: "https://i.imgur.com/CaYpsWf.png",
    tipo: "talento",
    id: "0113",
    coste: 5,
    prereqs: [3],
    onBuy: function() {
        if (buyTalent(this)) {
            personaje.jergas.push("Académica")
        }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Doctorado",
    texto: "Obtienes una especialización académica o técnica a tu elección",
    icono: "https://i.imgur.com/UtfWYSO.png",
    tipo: "talento",
    id: "0121",
    coste: 5,
    prereqs: [4],
    onBuy: function() {
       if (buyTalent(this)) {
        addToArray(1); updateView()
       }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Honoris causa",
    texto: "Obtienes un éxito adicional en todas tus tiradas de Investigación o Conocimiento relacionadas con tus especializaciones académicas.",
    icono: "https://i.imgur.com/faNatL1.png",
    tipo: "talento",
    id: "0124",
    coste: 5,
    prereqs: [4, "0121"],
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Postdoc",
    texto: "Obtienes una especialización académica o técnica a tu elección",
    icono: "https://i.imgur.com/UyANGWX.png",
    tipo: "talento",
    id: "0131",
    coste: 5,
    prereqs: [5],
    onBuy: function() {
        if (buyTalent(this)) {
            addToArray(1); updateView()
           }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Γνωθι σεαυτόν",
    texto: "Aumenta tu Concentración máxima en 1.",
    icono: "https://i.imgur.com/yFpSsT2.png",
    tipo: "talento",
    id: "0134",
    coste: 5,
    prereqs: [5],
    onBuy: function() {
        if (buyTalent(this)) {
           personaje.sec.concentracion[0]++; updateView()
           }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //INGENIERÍA
    {nombre: "Mono de trabajo",
    texto: "Recibes un punto menos de daño debido a explosiones y metralla.",
    icono: "https://i.imgur.com/5GyixZm.png",
    tipo: "talento",
    id: "0201",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Armero",
    texto: "Puedes modificar una de tus armas para añadirle o quitarle un rasgo",
    icono: "https://i.imgur.com/EDLKmWT.png",
    tipo: "talento",
    id: "0204",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Overclocking",
    texto: "Puedes gastar un punto de Concentración para aumentar el rendimiento de motores, thrusters, servidores o reactores en 2 durante un turno.",
    icono: "https://i.imgur.com/7IgUslG.png",
    tipo: "talento",
    id: "0211",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cinta de carrocero",
    texto: "Puedes gastar un punto de Concentración para que un sistema destruido siga funcionando durante la crisis, o hasta que sufra más daños.",
    icono: "https://i.imgur.com/ckSbdnS.png",
    tipo: "talento",
    id: "0212",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Armero II",
    texto: "Puedes realizar una segunda modificación a tu arma, para añadir / quitar un segundo rasgo o mejorar uno de sus atributos en 1.",
    icono: "https://i.imgur.com/61Sf1i5.png",
    tipo: "talento",
    id: "0224",
    prereqs: [4, "0204"],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Materiales improvisados",
    texto: "Puedes reemplazar materiales de cualquier diagrama por Chatarra, que obtienes reciclando objetos. Cada tipo de material reemplazado por chatarra aumenta la dificultad del diagrama en 1.",
    icono: "https://i.imgur.com/r81KcU4.png",
    tipo: "talento",
    id: "0231",
    prereqs: [5, undefined, "0233"],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Experto en demoliciones",
    texto: "Tus granadas y explosivos infligen 1 punto de daño más y tienen 1 UAM más de radio.",
    icono: "https://i.imgur.com/XXHoWoJ.png",
    tipo: "talento",
    id: "0233",
    prereqs: [5, undefined, "0231"],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //COMPUTACIÓN
    {nombre: "Telemetría",
    texto: "Puedes establecer sistemas de telemetría en los dispositivos que controles, que te permitirán detectar intrusiones externas.",
    icono: "https://i.imgur.com/WCbc0SM.png",
    tipo: "talento",
    id: "0301",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Proxies",
    texto: "Cuando consigas acceso a un sistema informático podrás añadirlo a tu lista de proxies, para usarlo… bueno, como proxy, en un futuro.",
    icono: "https://i.imgur.com/bNGKvuz.png",
    tipo: "talento",
    id: "0313",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Script kiddie",
    texto: "El primer intento fallido para forzar tu acceso a un sistema informático no levantará alarmas.",
    icono: "https://i.imgur.com/0pPaFlm.png",
    tipo: "talento",
    id: "0314",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "¿Para qué quiero yo una nevera smart?",
    texto: "Aumenta todo el daño que infiges a robots y sistemas de defensa automatizados en 1.",
    icono: "https://i.imgur.com/RIeHQBQ.png",
    tipo: "talento",
    id: "0322",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Grady Booch",
    texto: "Los ordenadores de la nave tienen un 33% de capacidad adicional y consumen un 25% menos de energía.",
    icono: "https://i.imgur.com/YgH4UVv.png",
    tipo: "talento",
    id: "0331",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Algoritmos balísticos avanzados",
    texto: "Puedes usar Computación en lugar de Disparar cuando utilices una terminal de artillería, pero costará 1 más de energía.",
    icono: "https://i.imgur.com/5TAmVdh.png",
    tipo: "talento",
    id: "0333",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //ATLETISMO
    {nombre: "Corredor",
    texto: "Aumenta tu velocidad de movimiento en 1.",
    icono: "https://i.imgur.com/1UpTmFE.png",
    tipo: "talento",
    id: "1001",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        if (buyTalent(this)) {personaje.sec.velocidad ++; updateView()}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Double time",
    texto: "Aumenta tu velocidad de movimiento en 1.",
    icono: "https://i.imgur.com/4w6mpcr.png",
    tipo: "talento",
    id: "1011",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        if (buyTalent(this)) {personaje.sec.velocidad ++; updateView()}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cargar",
    texto: "Tu acción de atacar cuerpo a cuerpo incluye también un movimiento normal.",
    icono: "https://i.imgur.com/u2Imap3.png",
    tipo: "talento",
    id: "1012",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Parkour",
    texto: "Puedes saltar por encima de obstáculos y cobertura ligera como parte de tu movimiento. 'Obstáculos' incluye a tus aliados, también.",
    icono: "https://i.imgur.com/SJpcHp3.png",
    tipo: "talento",
    id: "1014",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Demonio de la velocidad",
    texto: "Aumenta tu velocidad de movimiento en 1.",
    icono: "https://i.imgur.com/znarCOB.png",
    tipo: "talento",
    id: "1021",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
        if (buyTalent(this)) {personaje.sec.velocidad ++; updateView()}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Run and gun",
    texto: "Puedes gastar un punto de Concentración para disparar tras esprintar.",
    icono: "https://i.imgur.com/Vfns7u5.png",
    tipo: "talento",
    id: "1023",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "El Tango de la Muerte",
    texto: "Si la situación y el entorno lo permiten, puedes bailar con tu objetivo para seducirlo, lo que te confiere dos éxitos adicionales en tiradas de Elocuencia, Perspicacia, Mentir y Escuchar mientras bailes.",
    icono: "https://i.imgur.com/DtZRMJw.png",
    tipo: "talento",
    id: "1032",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Matrix",
    texto: "Cuando esprintes, los enemigos que realicen disparos de reacción contra ti necesitarán dos éxitos adicionales para acertar.",
    icono: "https://i.imgur.com/eht4T1d.png",
    tipo: "talento",
    id: "1034",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //DESTREZA
    {nombre: "Manos ágiles",
    texto: "Puedes recargar como acción gratuita tras atestar un golpe de gracia",
    icono: "https://i.imgur.com/43mDu7u.png",
    tipo: "talento",
    id: "1104",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Maestría técnica",
    texto: "Tiras un dado adicional en tus tiradas de Arte que impliquen elaborar algo material.",
    icono: "https://i.imgur.com/D7kcCnZ.png",
    tipo: "talento",
    id: "1112",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.car, personaje.hab.arte, 'Arte (con Maestría técnica)')
        shareEmbed(this)
    }
    },

    {nombre: "Malabarista",
    texto: "Cambiar de arma no cuenta como acción.",
    icono: "https://i.imgur.com/x2dnrlj.png",
    tipo: "talento",
    id: "1113",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "En Garde!",
    texto: "Mientras estés empuñando una espada obtienes un éxito adicional en tus tiradas para bloquear ataques cuerpo a cuerpo",
    icono: "https://i.imgur.com/boFi8BQ.png",
    tipo: "talento",
    id: "1114",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cuidadoso",
    texto: "Cuando falles una tirada para fabricar algo, puedes elegir no perder recursos pero ganarás un punto de estrés.",
    icono: "https://i.imgur.com/99LsZOC.png",
    tipo: "talento",
    id: "1121",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Contragolpe",
    texto: "Una vez por ronda, puedes responder con un ataque cuerpo a cuerpo gratuito tras bloquear un ataque",
    icono: "https://i.imgur.com/kEwIUKD.png",
    tipo: "talento",
    id: "1134",
    prereqs: [4, "1114"],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //COMBATE
    {nombre: "Camorrista",
    texto: "Obtienes una especialización con un tipo de arma cuerpo a cuerpo a tu elección",
    icono: "https://i.imgur.com/AQAenTs.png",
    tipo: "talento",
    id: "1201",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Pelear sucio",
    texto: "Obtienes dos éxitos adicionales en tus ataques cuerpo a cuerpo contra enemigos que tengan uno de tus aliados adyacentes",
    icono: "https://i.imgur.com/7sUy8k5.png",
    tipo: "talento",
    id: "1202",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.agi, personaje.hab.combate, 'Combate (con Pelear sucio)', 0, 2)
        shareEmbed(this)
    }
    },

    {nombre: "Matón",
    texto: "Obtienes una especialización con un tipo de arma cuerpo a cuerpo a tu elección",
    icono: "https://i.imgur.com/w2fyevg.png",
    tipo: "talento",
    id: "1211",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Ninja callejero",
    texto: "Puedes usar un arma de disparo y un arma cuerpo a cuerpo (ambas de una mano) como una sola acción",
    icono: "https://i.imgur.com/PQkiZ3v.png",
    tipo: "talento",
    id: "1214",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Guardaespaldas",
    texto: "Obtienes una especialización con un tipo de arma cuerpo a cuerpo a tu elección",
    icono: "https://i.imgur.com/lggjDwd.png",
    tipo: "talento",
    id: "1221",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Rastrero",
    texto: "Obtienes dos éxitos adicionales al atacar o disparar contra enemigos que te estén dando la espalda",
    icono: "https://i.imgur.com/pHvza94.png",
    tipo: "talento",
    id: "1222",
    prereqs: [4, "1202"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Batear",
    texto: "Al empuñar un arma cuerpo a cuerpo, puedes gastar tu reacción (o Concentración) para intentar batear una granada de vuelta a su lanzador.",
    icono: "https://i.imgur.com/lhv5ywO.png",
    tipo: "talento",
    id: "1223",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Herramienta predilecta",
    texto: "Elige un tipo de arma cuerpo a cuerpo que considerar predilecta. Al empuñar ese tipo de arma, podrás hacer uso de habilidades especiales que dependerán del tipo de arma.",
    icono: "https://i.imgur.com/Njs0y3Q.png",
    tipo: "talento",
    id: "1224",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Mercenario",
    texto: "Obtienes una especialización con un tipo de arma cuerpo a cuerpo a tu elección.",
    icono: "https://i.imgur.com/vyQWRQ9.png",
    tipo: "talento",
    id: "1231",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
        if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //SIGILO
    {nombre: "Voyeur",
    texto: "Mientras no te hayan detectado, obtienes un éxito adicional en tus tiradas de escuchar y observar.",
    icono: "https://i.imgur.com/E4dWeGv.png",
    tipo: "talento",
    id: "1304",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Herramienta mágica",
    texto: "Siempre llevas contigo tu “herramienta mágica” (un USB, destornillador, abrecartas… cualquier cosa pequeña). La herramienta mágica es indetectable. No preguntes.",
    icono: "https://i.imgur.com/Yo8SRVI.png",
    tipo: "talento",
    id: "1311",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Chaleco y portapapeles",
    texto: "Siempre llevas contigo tu “herramienta mágica” (un USB, destornillador, abrecartas… cualquier cosa pequeña). La herramienta mágica es indetectable. No preguntes.",
    icono: "https://i.imgur.com/8tVKP04.png",
    tipo: "talento",
    id: "1313",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Profesional",
    texto: "Obtienes un éxito adicional cuando dispares con armas silenciadas.",
    icono: "https://i.imgur.com/1KPh3eG.png",
    tipo: "talento",
    id: "1322",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.per, personaje.hab.disparar, 'Disparar (con Profesional)', 0, 2)
        shareEmbed(this)
    }
    },

    {nombre: "Fantasma",
    texto: "Los detectores de metales y sensores de movimiento no te detectan.",
    icono: "https://i.imgur.com/ozY3eR4.png",
    tipo: "talento",
    id: "1331",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    // PERSPICACIA
    {nombre: "Elemental",
    texto: "Puedes tirar Perspicacia para que el DJ te recuerde detalles que estás pasando por alto.",
    icono: "https://i.imgur.com/N2dIORD.png",
    tipo: "talento",
    id: "2001",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Perceptividad",
    texto: "Puedes saber el estrés y las heridas restantes de las personas a las que puedes ver",
    icono: "https://i.imgur.com/Ez1eZ3d.png",
    tipo: "talento",
    id: "2004",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Manipulador compulsivo",
    texto: "Obtienes un éxito adicional en tus tiradas para intentar seducir.",
    icono: "https://i.imgur.com/5bWD5Hw.png",
    tipo: "talento",
    id: "2013",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Ponerte en su lugar",
    texto: "Puedes gastar Concentración para adivinar las intenciones de los combatientes que puedas ver hasta el inicio de tu siguiente turno",
    icono: "https://i.imgur.com/bi9mr4g.png",
    tipo: "talento",
    id: "2024",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },
    
    {nombre: "Estoy en tu cabeza",
    texto: "Ponerte en su lugar también te permite adivinar las intenciones de naves que puedas detectar",
    icono: "https://i.imgur.com/XLn1fhp.png",
    tipo: "talento",
    id: "2033",
    prereqs: [5, "2024"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //OBSERVAR
    {nombre: "Ojo avizor",
    texto: "Aumenta tu alcance de visión en 1",
    icono: "https://i.imgur.com/8979cQl.png",
    tipo: "talento",
    id: "2101",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       if(buyTalent(this)) {personaje.sec.vision[1]++}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Oteador",
    texto: "Durante las crisis, tu línea de visión es visible para todos tus compañeros",
    icono: "https://i.imgur.com/jaQMGIA.png",
    tipo: "talento",
    id: "2113",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cálculo visual",
    texto: "Algunas de tus tiradas de investigación proporcionarán información contextual adicional.",
    icono: "https://i.imgur.com/WOfWACW.png",
    tipo: "talento",
    id: "2114",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Ojo de halcón",
    texto: "Aumenta tu alcance de visión en 2",
    icono: "https://i.imgur.com/3moKNLI.png",
    tipo: "talento",
    id: "2121",
    prereqs: [4, "2101"],
    coste: 5,
    onBuy: function() {
       if(buyTalent(this)) {personaje.sec.vision[1]+=2}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Omniscencia",
    texto: "Aumenta tu ángulo de visión en 45º.",
    icono: "https://i.imgur.com/SaHDCrL.png",
    tipo: "talento",
    id: "2131",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {personaje.sec.vision[0] += 45}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //ESCUCHAR
    {nombre: "Psicoanalista",
    texto: "Obtienes un éxito adicional en tus tiradas de Perspicacia tras escuchar a alguien durante unos minutos.",
    icono: "https://i.imgur.com/2u4k2D7.png",
    tipo: "talento",
    id: "2203",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Oído para chismes",
    texto: "De vez en cuando tu instinto te indicará que se está produciendo una conversación interesante al alcance de tu oído.",
    icono: "https://i.imgur.com/5TiOg8V.png",
    tipo: "talento",
    id: "2211",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Oído puesto",
    texto: "Además de tu cono de visión frontal, obtienes 3 UAM de visión a 360º.",
    icono: "https://i.imgur.com/S60ezJl.png",
    tipo: "talento",
    id: "2214",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Mimetismo",
    texto: "Puedes realizar una tirada de escuchar para intentar copiar la jerga de tu interlocutor.",
    icono: "https://i.imgur.com/6K8d2Yo.png",
    tipo: "talento",
    id: "2222",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Sismología",
    texto: "Como acción larga, puedes gastar un punto de concentración para pegar la oreja al suelo hasta tu siguiente turno, lo que cuenta como cubrirse y además te permite detectar y ubicar movimientos en un radio de 20 UAM.",
    icono: "https://i.imgur.com/ibWjabp.png",
    tipo: "talento",
    id: "2234",
    prereqs: [5, "2214"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //DISPARAR
    {nombre: "Aficionado",
    texto: "Obtienes una especialización con un tipo de arma de disparo a tu elección.",
    icono: "https://i.imgur.com/C4a4TNU.png",
    tipo: "talento",
    id: "2301",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
        if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Entusiasta",
    texto: "Obtienes una especialización con un tipo de arma de disparo a tu elección.",
    icono: "https://i.imgur.com/KZSM4Su.png",
    tipo: "talento",
    id: "2311",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Exmilitar",
    texto: "Obtienes una especialización con un tipo de arma de disparo a tu elección.",
    icono: "https://i.imgur.com/CFEXyxZ.png",
    tipo: "talento",
    id: "2321",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
        if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Estadounidense",
    texto: "Obtienes una especialización con un tipo de arma de disparo a tu elección.",
    icono: "https://i.imgur.com/Z3hU5Bd.png",
    tipo: "talento",
    id: "2331",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
        if(buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Arma predilecta",
    texto: "Elige un tipo de arma de disparo que considerar predilecta. Al empuñar ese tipo de arma, podrás hacer uso de habilidades especiales que dependerán del tipo de arma.",
    icono: "https://i.imgur.com/sJKY5nj.png",
    tipo: "talento",
    id: "2314",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Flexibilidad operacional",
    texto: "Puedes elegir un segundo tipo de arma como arma predilecta.",
    icono: "https://i.imgur.com/v2uiQUJ.png",
    tipo: "talento",
    id: "2334",
    prereqs: [5, "2314"],
    coste: 5,
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //MENTIR
    {nombre: "Impostor",
    texto: "Obtienes una jerga a tu elección, que no puede estar relacionada con tu pasado.",
    icono: "https://i.imgur.com/iDoIwK0.png",
    tipo: "talento",
    id: "3001",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       if(buyTalent(this)) {addToArray(0)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "M.Rajoy",
    texto: "Obtienes un 7.5% más de dinero como recompensa de misiones, en forma de dinero en negro.",
    icono: "https://i.imgur.com/8wCRpuI.png",
    tipo: "talento",
    id: "3014",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "S.W. Erdnase",
    texto: "Puedes lanzar dos dados más en todas tus tiradas para hacer trampas.",
    icono: "https://i.imgur.com/2s4uBkJ.png",
    tipo: "talento",
    id: "3021",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Una flechita",
    texto: "Obtienes un 10% más de dinero de todas las fuentes, en negro. Además, al comprar cosas con dinero en limpio obtienes un reembolso del 5%, también en negro.",
    icono: "https://i.imgur.com/mSX60e2.png",
    tipo: "talento",
    id: "3034",
    prereqs: [5, "3014"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    //ELOCUENCIA
    {nombre: "Popular",
    texto: "Obtienes una jerga adicional a tu elección.",
    icono: "https://i.imgur.com/NnLdUkR.png",
    tipo: "talento",
    id: "3101",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {addToArray(0)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Socialite",
    texto: "Obtienes una jerga adicional a tu elección.",
    icono: "https://i.imgur.com/oXnb1c7.png",
    tipo: "talento",
    id: "3121",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {addToArray(0)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Sofista",
    texto: "En discusiones y debates, rebatir el argumento de tu interlocutor de manera efectiva causará estrés.",
    icono: "https://i.imgur.com/AcUD8wq.png",
    tipo: "talento",
    id: "3112",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Orador nato",
    texto: "Obtienes dos éxitos adicionales en todo lo que hagas frente a un público, excepto en tiradas de Elocuencia.",
    icono: "https://i.imgur.com/FqXE79N.png",
    tipo: "talento",
    id: "3133",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //LIDERAZGO
    {nombre: "Ordenar",
    texto: "Durante las crisis, puedes usar tu acción larga para darle a uno de tus compañeros una acción larga dentro de tu turno.",
    icono: "https://i.imgur.com/4hY915e.png",
    tipo: "talento",
    id: "3202",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Colaborar",
    texto: "Puedes ayudar a tus compañeros en cualquier tirada, lo que les permite realizar la tirada dos veces y quedarse con el mejor resultado",
    icono: "https://i.imgur.com/q6wgGjr.png",
    tipo: "talento",
    id: "3211",
    prereqs: [3, undefined, "3213"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Dirigir",
    texto: "Puedes ayudar a tus compañeros en cualquier tirada, lo que te permite realizar una tirada de Liderazgo y añadir la mitad de éxitos a su tirada.",
    icono: "https://i.imgur.com/QtUWYHg.png",
    tipo: "talento",
    id: "3213",
    prereqs: [3, undefined, "3211"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Conexiones",
    texto: "Obtienes la jerga política y ciertos contactos.",
    icono: "https://i.imgur.com/lmTYYUp.png",
    tipo: "talento",
    id: "3223",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {personaje.jergas.push("Política"); updateView()}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Motivar",
    texto: "Una vez por Crisis puedes motivar a tus compañeros como acción larga, lo que os devuelve 1 de Concentración a todos.",
    icono: "https://i.imgur.com/5a8biaH.png",
    tipo: "talento",
    id: "3224",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "El Plan",
    texto: "Antes de una escena puedes elaborar El Plan. Mientras os ciñáis al Plan, obtendréis un éxito adicional en vuestras tiradas.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "3231",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //ARTE 
    {nombre: "Amateur",
    texto: "Obtienes una especialización artística o picaresca a tu elección",
    icono: "https://i.imgur.com/rBe6tch.png",
    tipo: "talento",
    id: "3301",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Indie",
    texto: "Obtienes una especialización (artística o picaresca) o una jerga, a tu elección",
    icono: "https://i.imgur.com/rpV6P7u.png",
    tipo: "talento",
    id: "3311",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Auteur",
    texto: "Obtienes una especialización artística o picaresca a tu elección",
    icono: "https://i.imgur.com/PYZFjO7.png",
    tipo: "talento",
    id: "3321",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {addToArray(1)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Superstar",
    texto: "Obtienes una especialización (artística o picaresca) o una jerga, a tu elección",
    icono: "https://i.imgur.com/z9WrPlX.png",
    tipo: "talento",
    id: "3331",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Pirotecnia",
    texto: "Lanzar bengalas, bombas de humo o granadas cegadoras cuenta como acción corta en lugar de acción larga.",
    icono: "https://i.imgur.com/KdwO73F.png",
    tipo: "talento",
    id: "3313",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Accionismo vienés",
    texto: "Aumenta el daño bonus de tus críticos de 1 a 1 por cada éxito adicional.",
    icono: "https://i.imgur.com/rMOuPQo.png",
    tipo: "talento",
    id: "3314",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Fama",
    texto: "Tu reputación (artística y / o criminal) te precede",
    icono: "https://i.imgur.com/C2Z5QZM.png",
    tipo: "talento",
    id: "3323",
    prereqs: [4, "3321"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Savant",
    texto: "Elige algo que considerar tu forma artística (literalmente cualquier cosa medianamente específica). Obtienes un éxito adicional en ese algo.",
    icono: "https://i.imgur.com/FxBD7a5.png",
    tipo: "talento",
    id: "3324",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Banksy",
    texto: "Recuperas un punto de Concentración al causar daños materiales considerables",
    icono: "https://i.imgur.com/BKJhiVT.png",
    tipo: "talento",
    id: "3332",
    prereqs: [5, undefined, "3334"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Pollock",
    texto: "Recuperas un punto de Concentración al atestar un golpe de gracia con un crítico o un golpe letal",
    icono: "https://i.imgur.com/kGTvXMk.png",
    tipo: "talento",
    id: "3334",
    prereqs: [5, undefined, "3332"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    // PILOTAR
    {nombre: "Spacer",
    texto: "No sufres efectos psicológicos adversos por pasar mucho tiempo en espacios confinados.",
    icono: "https://i.imgur.com/dzvzSSf.png",
    tipo: "talento",
    id: "4001",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Bucanero Joviano",
    texto: "Puedes conseguir e instalar componentes inusuales en tu nave",
    icono: "https://i.imgur.com/4aNdOIq.png",
    tipo: "talento",
    id: "4012",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Flyboy",
    texto: "Aumenta el numero de Gs que puedes resistir antes de sufrir heridas de 3 a 6.",
    icono: "https://i.imgur.com/qS8VGgp.png",
    tipo: "talento",
    id: "4014",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Membresía del Cockpit Club",
    texto: "Obtienes una jerga relacionada con tu experiencia como piloto, y acceso al club y al canal de SRN",
    icono: "https://i.imgur.com/76v8iyA.png",
    tipo: "talento",
    id: "4021",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {addToArray(0)}
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Temerario",
    texto: "Puedes sacarle 90º más de rotación y 2 más de aceleración a cualquier vehículo que estés pilotando, pero a costa de 1 más de energía, e invalidar la garantía.",
    icono: "https://i.imgur.com/rrB8kqB.png",
    tipo: "talento",
    id: "4032",
    prereqs: [5, "4012"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Top Gun",
    texto: "Pilotar y usar armas en un mismo turno no cuenta como dos acciones distintas",
    icono: "https://i.imgur.com/WkQtw8N.png",
    tipo: "talento",
    id: "4034",
    prereqs: [5, "4014"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    // ESQUIVAR
    {nombre: "Esquivar responsabilidades",
    texto: "Puedes usar Esquivar para intentar esquivar responsabilidades",
    icono: "https://i.imgur.com/H6DNkX4.png",
    tipo: "talento",
    id: "4101",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Esquivar preguntas",
    texto: "Tiras tres dados adicionales en tus tiradas de Mentir cuando estés esquivando preguntas",
    icono: "https://i.imgur.com/RUINpH7.png",
    tipo: "talento",
    id: "4111",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.car, personaje.hab.mentir, "Mentir (con Esquivar Preguntas)", 3)
        shareEmbed(this)
    }
    },

    {nombre: "Esquivar paparazzi",
    texto: "Tiras tres dados adicionales en tus tiradas de Sigilo, cuando estés evitando ser visto por una cámara",
    icono: "https://i.imgur.com/VkEKSGe.png",
    tipo: "talento",
    id: "4121",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.agi, personaje.hab.sigilo, "Sigilo (con Esquivar paparazzi)", 3)
        shareEmbed(this)
    }
    },

    {nombre: "Moonwalk",
    texto: "Tras esquivar un ataque, puedes moverte 1 UAM en cualquier dirección de manera gratuita",
    icono: "https://i.imgur.com/rR96m9k.png",
    tipo: "talento",
    id: "4124",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Matrix",
    texto: "Puedes intentar Esquivar cuando te disparen y no dispongas de cobertura.",
    icono: "https://i.imgur.com/FpC4xgf.png",
    tipo: "talento",
    id: "4132",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    // REACCIONAR 
    {nombre: "Piensa rápido",
    texto: "Tus reacciones durante una Crisis pueden ser cualquier acción, no solamente ataques.",
    icono: "https://i.imgur.com/Ri5hfqb.png",
    tipo: "talento",
    id: "4202",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Siempre atento",
    texto: "Puedes cambiar tu orientación tras ser objetivo de un ataque enemigo o fallar un disparo de reacción",
    icono: "https://i.imgur.com/Sqjux3f.png",
    tipo: "talento",
    id: "4211",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Previsión",
    texto: "Durante una Crisis puedes reaccionar ante cualquier situación que declares (“Si se rompe el motor…”, “Si mi compañero se aparta…”)",
    icono: "https://i.imgur.com/WDLk0NI.png",
    tipo: "talento",
    id: "4213",
    prereqs: [3, "4202"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Hoplita",
    texto: "Si te atacan mientras estás vigilando con un arma cuerpo a cuerpo, tu ataque de reacción se producirá antes del ataque enemigo.",
    icono: "https://i.imgur.com/hSZ0D8b.png",
    tipo: "talento",
    id: "4214",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "¡A cubierto!",
    texto: "Puedes gastar Concentración para intentar lanzarte sobre un aliado que sea objetivo de un ataque. Al hacerlo, pasarás a ser el objetivo del ataque, que podrás intentar esquivar con Reaccionar.",
    icono: "https://i.imgur.com/ziLWTws.png",
    tipo: "talento",
    id: "4223",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Centinela",
    texto: "Puedes gastar un punto de Concentración para poder realizar ataques de reacción frente a todos los enemigos durante una ronda de Crisis",
    icono: "https://i.imgur.com/S68ZZsF.png",
    tipo: "talento",
    id: "4231",
    prereqs: [5, "4211"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //AGUANTE
    {nombre: "¡Solo es un rasguño!",
    texto: "Si tus heridas caen por debajo de 1, puedes hacer una tirada de Aguante para intentar no morirte en el acto, aunque quedarás incapacitado igualmente.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5003",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Tipo duro",
    texto: "Puedes realizar tiradas de Aguante para intentar resistir los efectos de granadas cegadoras y de humo, spray pimienta y similares.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5011",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Masoquista",
    texto: "Recuperas 1 punto de Concentración al recibir daño crítico.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5014",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Pies firmes",
    texto: "Puedes gastar Concentración para evitar que te empujen o derriben",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5022",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Titán",
    texto: "Ignora el primer golpe que consiga causarte daño en cada crisis",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5031",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Berserker",
    texto: "Recuperas 1 punto de Concentración al recibir daño cuerpo a cuerpo.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5034",
    prereqs: [5, "5014"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //FUERZA
    {nombre: "Pase largo",
    texto: "Puedes aumentar la distancia de lanzamiento máxima de armas arrojadizas y granadas en 3 UAM, pero a costa de -1 éxito en la tirada",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5102",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Rompescudos",
    texto: "Puedes gastar Concentración para obtener un éxito adicional y aumentar el daño de tus ataques cuerpo a cuerpo en 1.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5104",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Gunny",
    texto: "Puedes usar ametralladoras u otras armas pesadas similares sin que tengan que estar ancladas al suelo.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5114",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Placar",
    texto: "Puedes placar como ataque cuerpo a cuerpo, infligiendo la mitad del daño pero derribando al objetivo con un ataque exitoso.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5123",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Héroe de acción",
    texto: "Puedes empuñar armas a dos manos con una sola mano, pero con un penalizador de -2 éxitos a las tiradas para acertar.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5124",
    prereqs: [5, "5114"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    // PROPIOCEPCIÓN
    {nombre: "Automedicación",
    texto: "Aumenta los PVs temporales y el estrés perdido mediante medicamentos que te administres a ti mismo en 2.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5201",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Conoisseur",
    texto: "Puedes descubrir los efectos de cualquier droga o medicamento usándola sobre ti mismo.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5212",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Electroquímica",
    texto: "Consumir drogas duras en combate cuenta como acción corta. Algunas obtendrán el efecto adicional de restaurar Concentración.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5214",
    prereqs: [3, "5212"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Charla con el cerebro reptiliano",
    texto: "En ocasiones podrás comunicarte con tu cerebro reptiliano (o tu Id).",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5223",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Time to go to work in the shit factory",
    texto: "Una vez por turno puedes realizar una tirada de Aguante para recuperar el conocimiento, si estabas sedado o inconsciente.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "5231",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //INTIMIDAR
    {nombre: "Esprit de corps",
    texto: "Empuñar un arma te da un bonus a tu intimidación, que escala con lo mucho que imponga tu arma.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6001",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "La Mirada",
    texto: "Obtienes dos éxitos adicionales en tus tiradas para intimidar a todo aquél que haya intentado intimidarte y haya fallado.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6014",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.vol, personaje.hab.intimidar, "Intimidar (con La Mirada)", 0, 2)
        shareEmbed(this)
    }
    },

    {nombre: "Terror sin fronteras",
    texto: "Puedes intentar intimidar objetos inanimados",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6022",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Brutalizar",
    texto: "Tras atestar un golpe letal, o matar con un arma cuerpo a cuerpo o escopeta puedes intentar intimidar como acción gratuita",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6023",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Too angry to die",
    texto: "Cuando recibas daño letal, puedes gastar Concentración para sobrevivir con 1 herida.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6031",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //RESISTIR
    {nombre: "Cara de poker",
    texto: "Es más difícil para los demás adivinar tus emociones y pensamientos",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6101",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Yonki de la adrenalina",
    texto: "Durante las Crisis, si tu estrés está por encima de la mitad del máximo, lanzas un dado más en todas tus tiradas.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6114",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Perspectiva",
    texto: "Tu vida es una mierda, pero podría ser peor. Reduce todo el estrés recibido en 1, pero nunca por debajo de 1.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6123",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Meditar",
    texto: "durante las Crisis, puedes pararte a meditar dedicándole todo tu turno. Si no sufres daño hasta el inicio de tu siguiente turno, recuperarás un punto de Concentración y de estrés.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6132",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },


    //PSIÓNICA
    {nombre: "Meditar",
    texto: "Crees que los ruidos en las paredes son goblins espaciales que han venido a comerse tus calcetines. Tu sueño es ligero y te despiertas con cualquier perturbación, pero recuperas menos estrés por las noches.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6201",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Sensibilidad psíquica",
    texto: "Te percatas automáticamente si alguien está intentando utilizar un poder psíquico sobre ti.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6203",
    prereqs: [2],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cazador de brujas",
    texto: "Puedes lanzar Psiónica para intentar descubrir si alguna persona cercana posee poderes psíquicos.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6212",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Chakras alineados",
    texto: "Aumenta tu Concentración máxima en 1. Si tras aumentar tu Concentración, ésta no es un número primo, este talento no tiene efecto alguno y pierdes el beneficio, hasta que tu Concentración vuelva a ser Primo-1. (haz clic para recalcular)",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6214",
    prereqs: [3],
    coste: 5,
    onBuy: function() {
       if (buyTalent(this)) {
        personaje.sec.concentracion[0] ++
        if (personaje.sec.concentracion[0] != 5 && personaje.sec.concentracion[0] != 7 && personaje.sec.concentracion[0] != 11) {personaje.sec.concentracion[0]--}
       }
    },
    onClick: function() {
        personaje.sec.concentracion[0] ++
        if (personaje.sec.concentracion[0] != 5 && personaje.sec.concentracion[0] != 7 && personaje.sec.concentracion[0] != 11) {personaje.sec.concentracion[0]--}
        shareEmbed(this)
    }
    },

    {nombre: "Manía persecutoria",
    texto: "Tus compañeros de tripulación son goblins disfrazados. Oh, Dios. ¿Es eso un calcetín desparejado?. Cuando vayan a emboscarte o tenderte una trampa, puedes sentir que algo va mal. Recibes un éxito automático en todas tus tiradas para tender trampas o fortificar tu ubicación.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6221",
    prereqs: [4, "6201"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Investigador paranormal",
    texto: "Lanzas tres dados adicionales en tus tiradas de Investigación relacionadas con sucesos paranormales. La verdad está ahí fuera.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6224",
    prereqs: [4],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.int, personaje.hab.investigacion, "Investigación (Paranormal)", 3)
        shareEmbed(this)
    }
    },

    {nombre: "Suertudo",
    texto: "Tienes un aura probabilística chunga que hace que las cosas salgan a tu favor más a menudo de lo que deberían. Puedes gastar Concentración para repetir tiradas durante crisis, y obtienes también un re-roll por día de juego, no acumulables.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6231",
    prereqs: [5],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Skill Issue",
    texto: "Tu aura probabilística chunga drena la suerte de los demás, con lo que puedes usar tus repeticiones de tirada para obligar a otros a repetir sus tiradas.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "talento",
    id: "6233",
    prereqs: [5, "6231"],
    coste: 5,
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },
]







//                  ----- ARQUETIPOS -----
let arquetipos = [
    [//ESPÍA
    {nombre: "Agente encubierta",
    texto: "Con algo de tiempo, puedes construir una buena identidad falsa. Obtienes un éxito adicional en tus tiradas de Mentir mientras finjas ser tu identidad falsa y dos éxitos adicionales en tus tiradas de Arte para falsificar documentos y credenciales para esa identidad falsa",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8802",
    prereqs: [0],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Muerte silenciosa",
    texto: "Causas un punto de daño adicional al usar armas silenciadas o silenciosas",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8810",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Actriz de método",
    texto: "Obtienes temporalmente la jerga que correspondería a tu falsa identidad",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8815",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Acechadora",
    texto: "Generalmente al comienzo de las crisis los enemigos no sabrán que estás ahí. Puedes mantenerte oculta tras cobertura y mediante tiradas de Sigilo si haces algo que te exponga.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8820",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Interrogación sutil",
    texto: "Puedes realizar tiradas de sigilo para intentar disimular un interrogatorio y hacer que parezca una conversación amigable.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8822",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Fat Larry & Associates",
    texto: "Puedes encontrar el camión de Fat Larry en cualquier puerto espacial o ciudad importante. Fat Larry compra y vende material ilícito a precios competitivos.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8823",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Vigilancia informática",
    texto: "Al establecer una nueva identidad falsa obtienes también acceso temporal a un nuevo canal de SRN, a tu elección, relacionado con la nueva identidad.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8824",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Nochnyye Vedma",
    texto: "Tu bonificación de Acechadora también se aplica a todos los cazas u otros vehículos pequeños que pilotes. Fuera de las crisis, obtienes dos éxitos adicionales en tus tiradas de Sigilo para que la nave que pilotas pase desapercibida.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8831",
    prereqs: [3, "8820"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Célula encubierta",
    texto: "Puedes preparar identidades falsas para el resto de tu grupo. Obtendrán el bonus a sus tiradas para Mentir y (lo más importante) no harán peligrar tu tapadera",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8834",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Archivo central",
    texto: "Puedes solicitar copias de los ficheros de personas concretas. Obtener el fichero costará algo de esfuerzo, y tardarás en recibirlo, pero proporcionará información extensa sobre la persona que estés investigando",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8835",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Capa y puñal",
    texto: "Tus ataques cuerpo a cuerpo sobre enemigos que no te hayan detectado serán siempre mortales",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8840",
    prereqs: [4, "8820"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Deep undercover",
    texto: "Si alguien descubre tu verdadera identidad, se llevará un chasco porque tu verdadera identidad también era una identidad falsa. Podrás crear tu personaje de nuevo, recibiendo un reembolso de todos los PX gastados para que puedas reasignarlos como consideres.",
    icono: "https://i.imgur.com/eSEBbVD.png",
    tipo: "arquetipo",
    id: "8844",
    prereqs: [4],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    }],
    
    [//HACKER
    {nombre: "Datajack",
    texto: "El hacker puede realizar ataques cuerpo a cuerpo con el Datajack, un arma especial siempre accesible para el hacker (daño 1, 1 ataque por turno). Si el ataque impacta, el hacker podrá intentar un hackeo sobre el objetivo a cambio de un punto de Concentración, pudiendo sabotear o desactivar entidades electrónicas",
    icono: "https://i.imgur.com/Ke1A5IZ.png",
    tipo: "arquetipo",
    id: "8802",
    prereqs: [0],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Gaming mode",
    texto: "Puedes reducir el tiempo necesario para realizar una acción (de turno a larga, de larga a corta, de corta a gratis) sufriendo una herida en lugar de gastando Concentración",
    icono: "https://i.imgur.com/4zYpXmr.png",
    tipo: "arquetipo",
    id: "8810",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Ingeniería social",
    texto: "Además de encontrar vulnerabilidades en sistemas electrónicos, también las encuentras en cerebros. Obtienes dos éxitos adicionales en tus tiradas para mentir cuyo objetivo sea conseguir contraseñas o saltarte sistemas de seguridad",
    icono: "https://i.imgur.com/k8g49Ex.png",
    tipo: "arquetipo",
    id: "8814",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        lanzarDados(personaje.atr.car, personaje.hab.mentir, "Mentir (con Ingeniería social)", 0, 2)
        shareEmbed(this)
    }
    },

    {nombre: "Telehack",
    texto: "El hacker puede lanzar dardos de hackeo remoto (como arma arrojadiza, flecha o con lanzagranadas, daño 1). Los objetivos quedarán con el dardo adherido, permitiendo al Hacker intentar hackeos como si fuera mediante el datajack",
    icono: "https://i.imgur.com/E3n9b00.png",
    tipo: "arquetipo",
    id: "8820",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Barrido inalámbrico",
    texto: "Puedes gastar 1 Concentración y el turno entero para realizar un barrido de frecuencias inalámbricas, revelando la presencia y ubicación aproximada de dispositivos inalámbricos cercanos",
    icono: "https://i.imgur.com/KIC3vrO.png",
    tipo: "arquetipo",
    id: "8822",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Protocolo Tíbet",
    texto: "Puedes implantar el Protocolo Tibet como acción de hackeo por datajack, desactivando las medidas de seguridad del sistema objetivo y haciendo que se sobrecaliente peligrosamente. El objetivo sufrirá dos heridas por turno hasta que deje de funcionar. Si tiene municiones explosivas encima, detonarán también.",
    icono: "https://i.imgur.com/PLl2M4X.png",
    tipo: "arquetipo",
    id: "8824",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Funcionamiento autónomo",
    texto: "Puedes escribir un script (en pseudocódigo, usando funciones como identificarObjetivo(cercania) o lanzarGranada()) para que el robot pueda seguir operando de forma autónoma en caso de no poder recibir las instrucciones del hacker.",
    icono: "https://i.imgur.com/hW3s7kx.png",
    tipo: "arquetipo",
    id: "8825",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "El Botón Rojo",
    texto: "Si tu robot es destruido (o a voluntad) puedes pulsar El Botón, sobrecargando el generador termoeléctrico de radioisótopos que alimenta el robot para provocar una pequeña explosión nuclear.",
    icono: "https://i.imgur.com/naRTtyN.png",
    tipo: "arquetipo",
    id: "8832",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Talento placeholder",
    texto: "No hace absolutamente nada. Has tenido más de un mes para decirme cosas, como dijiste que harías. Ahora te jodes y bailas. Con cariño.",
    icono: "https://i.imgur.com/gwcXWXm.png",
    tipo: "arquetipo",
    id: "8834",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Modo incógnito",
    texto: "Tus actividades informáticas ilícitas realizadas a través de un proxy solo pueden ser rastreadas hasta ese proxy",
    icono: "https://i.imgur.com/6rV8nsY.png",
    tipo: "arquetipo",
    id: "8835",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Telehack autopropulsado",
    texto: "Puedes incorporar paquetes de telehack en cohetes, misiles y torpedos. En lugar de infligir daño, marcarán el sistema en el que impacten de la nave objetivo permitiendo al hacker intentar hackear la nave como si estuviera usando un datajack",
    icono: "https://i.imgur.com/otC7sM3.png",
    tipo: "arquetipo",
    id: "8840",
    prereqs: [4, "8820"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Protocolo Enoshima",
    texto: "Puedes implantar el Protocolo Enoshima como acción de hackeo por datajack, lo que te permite tomar el control de una entidad electrónica indefinidamente. Puedes tener tantos dispositivos sometidos como quieras, pero solo puedes dar ordenes individualmente",
    icono: "https://i.imgur.com/glLutnL.png",
    tipo: "arquetipo",
    id: "8844",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    }],

    [//MAGNATE
    {nombre: "Línea de crédito",
    texto: "Puedes ponerte en contacto con La Empresa para solicitar algo de liquidez con la que cubrir tus gastos. La dificultad depende de la cantidad de dinero y frecuencia con la que se use esta habilidad.",
    icono: "https://i.imgur.com/lJmKUmx.png",
    tipo: "arquetipo",
    id: "8803",
    prereqs: [0],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Asistente personal",
    texto: "Cuentas con un leal asistente personal que te ayudará en lo que pueda: Principalmente llevando tus cosas y gestionando tu agenda, aunque también luchará si es necesario",
    icono: "https://i.imgur.com/q2J6umU.png",
    tipo: "arquetipo",
    id: "8812",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Descuento Ejecutivo",
    texto: "Tienes un 20% de descuento en los productos y servicios ofrecidos por La Empresa.",
    icono: "https://i.imgur.com/ALwtaHm.png",
    tipo: "arquetipo",
    id: "8815",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Micromanaging",
    texto: "Obtienes el talento Ordenar, de Liderazgo (o un reembolso, si ya lo tenías). Si lo usas sobre tu Asistente personal, éste obtiene también dos éxitos adicionales en su tirada",
    icono: "https://i.imgur.com/m8lyMrR.png",
    tipo: "arquetipo",
    id: "8820",
    prereqs: [2, "8812"],
    coste: "☆",
    onBuy: function() {
        if(buyTalent(this)) {
            if (personaje.talentos.includes("3202")) {
                personaje.exp[0] += 5
            }
            else {personaje.talentos.push("3202")}
       }
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Coaching",
    texto: "Disparar a través de tu asistente personal, o a un objetivo a menos de 2 UAM 'inspirará' al asistente, permitiéndole tirar dos dados más en cualquier tirada hasta el siguiente turno del Magnate",
    icono: "https://i.imgur.com/gO0CEno.png",
    tipo: "arquetipo",
    id: "8821",
    prereqs: [2, "8812"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Caddy",
    texto: "Puedes intercambiar armas con tu asistente como acción corta. Además, tu Asistente obtiene +3 heridas máximas, +2 a la resistencia del traje y +1 a Voluntad.",
    icono: "https://i.imgur.com/AFoyIMM.png",
    tipo: "arquetipo",
    id: "8832",
    prereqs: [3, "8812"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Cómo osas",
    texto: "Cuando el asistente personal muera en una crisis (incluso si es consecuencia directa del Magnate, jamás admitiría que ha sido culpa suya) el magnate recuperará toda su Concentración y recibirá un éxito adicional en todas sus tiradas hasta el final de la Crisis. Además, todos los ataques realizados contra la persona '''responsable''' de la muerte del asistente infligirán un punto más de daño.",
    icono: "https://i.imgur.com/oo814MD.png",
    tipo: "arquetipo",
    id: "8843",
    prereqs: [4, "8812"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "¡Cúbreme!",
    texto: "Tu bonificación por cobertura aumenta en 1 adicional si hay alguien entre tu atacante y tu. Además, puedes gastar Concentración para redirigir ataques a tu asistente personal",
    icono: "https://i.imgur.com/qmVIB04.png",
    tipo: "arquetipo",
    id: "8824",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Paraíso fiscal",
    texto: "Obtienes un codiciado pasaporte de Costa de Marfil, que por algún motivo te permite acceder por la vía rápida de todos los puertos espaciales, sin pasar por aduanas. Además, hará que sea mucho más fácil conseguir que las personas ricas e influyentes del lugar te presten su tiempo.",
    icono: "https://i.imgur.com/67YDgJe.png",
    tipo: "arquetipo",
    id: "8825",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Too big to fail",
    texto: "Puedes endeudarte, tanto como quieras, sin consecuencias ni intereses. Eso sí, todo lo que ganéis en dinero limpio desde ese momento (o a través de tu línea de crédito) deberá ir a pagar esa deuda, y no podrás coger otro préstamo hasta que no hayas terminado de pagar ese.",
    icono: "https://i.imgur.com/Hot79OT.png",
    tipo: "arquetipo",
    id: "8834",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Paga extra",
    texto: "Puedes darle una propinita a cualquier PNJ, lo que te permite mejorar (o empeorar) el resultado de sus tiradas pagando 100 créditos por éxito añadido o sustraído.",
    icono: "https://i.imgur.com/oCeL0p3.png",
    tipo: "arquetipo",
    id: "8835",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Contribución política",
    texto: "Puedes 'financiar campañas electorales 😉😉', lo que te permite comprar éxitos adicionales en tus tiradas de Elocuencia, Mentir y Liderazgo. Además, puedes intentar sobornar a enemigos para que no te molesten (o incluso cambien de bando) como acción larga. El coste del soborno dependerá del enemigo",
    icono: "https://i.imgur.com/PnAxxNB.png",
    tipo: "arquetipo",
    id: "8845",
    prereqs: [4],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }}],


    [//PERFUMISTA
    {nombre: "Perfumería metafísica",
    texto: "Puedes elaborar perfumes con efectos que van más allá de la química convencional. Los perfumes tienen dos efectos distintos según sobre quién se usen, uno sobre la perfumista y otro sobre el resto de entidades con consciencia propia. Además, aprendes a elaborar 'Aurora' Los perfumes pueden usarse como una persona civilizada mediante un difusor o como granadas, destruyendo el perfume y aplicándolo sobre todas las entidades a 3 UAM del punto de impacto. Preparar un frasco de perfume requiere unas cuatro horas, y su potencia se determinará en el momento de la preparación. Puedes tener tantos frascos de perfume preparados como tu Concentración máxima. Cada entidad solo puede estar bajo los efectos de un perfume a la vez",
    icono: "https://i.imgur.com/gi1hWW7.png",
    tipo: "arquetipo",
    id: "8802",
    prereqs: [0],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Aerosolizador",
    texto: "Puedes usar tus perfumes en aerosol, afectando a todas las entidades en un cono de 90º y 4 UAM.",
    icono: "https://i.imgur.com/DivfQCo.png",
    tipo: "arquetipo",
    id: "8810",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Fascinación",
    texto: "Sobre la perfumista proporciona éxitos adicionales en tiradas de Carisma iguales a la mitad de los éxitos obtenidos al elaborar el perfume. Sobre otros, (si no se resiste el efecto) reduce su voluntad en 2 y provoca dos puntos de estrés, además de interrumpir cualquier acción que estuvieran llevando a cabo",
    icono: "https://i.imgur.com/nLYlzx0.png",
    tipo: "arquetipo",
    id: "8814",
    prereqs: [1],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Aroma sutil",
    texto: "Fuera de una Crisis, es mucho menos probable que los demás perciban que están siendo afectados por tus perfumes y no intenten resistirlos.",
    icono: "https://i.imgur.com/J8K9tl2.png",
    tipo: "arquetipo",
    id: "8821",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Sublimación optimizada",
    texto: "Aumenta el alcance de las explosiones de perfume de 3 a 5 UAM de radio.",
    icono: "https://i.imgur.com/TGmA6o3.png",
    tipo: "arquetipo",
    id: "8822",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Bailarina solitaria",
    texto: "Sobre la perfumista aumenta la dificultad de ser acertada por disparos en 2 y un éxito adicional en tiradas de sigilo. Sobre los demás (que no lo resistan) reduce su Percepción y su distancia de visión a la mitad",
    icono: "https://i.imgur.com/1zziemF.png",
    tipo: "arquetipo",
    id: "8824",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Pasión ardiente",
    texto: "Sobre la perfumista aumenta el daño de ataques desarmados en 2. Sobre enemigos inflige tantas heridas como éxitos obtenidos en la tirada de preparación y aumenta el daño que sufren de ataques de la perfumista en 1",
    icono: "https://i.imgur.com/7I8Yqfw.png",
    tipo: "arquetipo",
    id: "8825",
    prereqs: [2],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Perfume guiado",
    texto: "Puedes gastar Concentración para guiar tu aerosol, lanzándolo en línea recta hasta 10 UAM, afectando a todos las las entidades en la trayectoria",
    icono: "https://i.imgur.com/vn8Ge7l.png",
    tipo: "arquetipo",
    id: "8830",
    prereqs: [3, "8810"],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Deseo fugaz",
    texto: "Sobre la perfumista crea una ilusión de la perfumista (que podrá hacer algo sencillo como andar en línea recta o fingir leer el periódico). La ilusión puede hacer ruido. Sobre los demás, crea ilusiones animadas de las entidades afectadas, pero no podrán desplazarse",
    icono: "https://i.imgur.com/m81lA08.png",
    tipo: "arquetipo",
    id: "8834",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Ángel",
    texto: "Todas las entidades afectadas reciben tres éxitos adicionales a todas sus tiradas para resistir efectos psíquicos",
    icono: "https://i.imgur.com/9RDXALx.png",
    tipo: "arquetipo",
    id: "8835",
    prereqs: [3],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Sirviente de niebla",
    texto: "Un perfume especial que convoca una criatura gaseosa con cierto grado de consciencia propia. El sirviente cuenta como perfume activo sobre la perfumista y convocarlo siempre destruirá el frasco en el que estaba. No tiene forma directa de causar daño pero la perfumista puede usar sus perfumes a través del sirviente y ver todo lo que esté en un radio de 4 UAM del sirviente.",
    icono: "https://i.imgur.com/dM8PlMy.png",
    tipo: "arquetipo",
    id: "8840",
    prereqs: [4],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },

    {nombre: "Secretos profesionales",
    texto: "Puedes gastar Concentración para potenciar tus perfumes, aumentando en 2 el daño, los éxitos que proporcionan o lo mucho que modifican atributos. Potenciar un perfume siempre romperá el frasco.",
    icono: "https://i.imgur.com/ctN9UYk.png",
    tipo: "arquetipo",
    id: "8843",
    prereqs: [4],
    coste: "☆",
    onBuy: function() {
       buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },
    ]
]

var arrows = []