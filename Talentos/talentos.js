/* 
nombre: string
texto: string
icono: string (url)
tipo: "talento" o "arquetipo"
id: string (4 numeros: atributo - habilidad - columna - fila). Los talentos interdisciplinarios son 77xx y los del arquetipo 88xx
prerequs: array [nivel mínimo del arquetipo / habilidad correspondiente, string del talento anterior, string del talento que excluye]
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

generateArrows = () => {
}

ArrowUpdater = () => {

}

tooltipHandler = (talent) => {
    var cursor = [event.clientX, event.clientY]


    document.getElementById("tth3").innerHTML = talent.nombre
    document.getElementById("ttp").innerHTML = talent.texto
    document.getElementById("tooltip").style.display = "inline"
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
    prereqs: [5, undefined, "0243"],
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
    prereqs: [5, undefined, "0241"],
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
]

var arrows = []
generateButtons()