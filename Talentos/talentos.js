/* 
nombre: string
texto: string
icono: string (url)
tipo: "talento" o "arquetipo"
id: string (4 numeros: atributo - habilidad - columna - fila). Los talentos interdisciplinarios son 70xx y los del arquetipo 80xx
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
        var habilidad = talent.id[1]
        if (habilidad == 7) {return 2} // Interdisciplinaries have no prerequisites
        else if (talent.prereqs[0] <= Object.entries(personaje.hab)[habilidad][1][0]) { //min lvl verification
            if (talent.prereqs[1] == undefined || personaje.talentos.includes(talent.prereqs[1])) { //talent verification
                if (talent.prereqs[2] == undefined || (personaje.talentos.includes(talent.prereqs[2]) == false)) {return 1} //exclusive talent verification
                else {return 2}
            }
        }
        else {return 2}
    }

    
    else {return 1}
}

generateButtons = () => {
    for (i=0; i < talents.length; i++) {
        var tabID = talents[i].id.slice(0,2)
        var cellPos = [talents[i].id.slice(3), talents[i].id.slice(2,3)]
        var button = document.getElementById(tabID).rows[cellPos[0]].cells[cellPos[1]].appendChild(document.createElement("img")) //We create the button and add it to the table

        button.setAttribute("id", talents[i].id) // ID
        button.setAttribute("src", talents[i].icono) // IMAGE
        button.setAttribute("onmouseover", "tooltipHandler(talents["+i+"])")
        button.setAttribute("onmouseout", "hideTooltip()")
    }
}

buttonUpdater = () => {
    for (i=0; i < talents.length; i++) {

    }
}

generateArrows = () => {
}

ArrowUpdater = () => {

}

receptacleUpdater = () => {
    for (i = 0; i < talents.length; i++) {

    }
}

tooltipHandler = (talent) => {
    var cursor = [event.clientX, event.clientY]
    console.log(cursor)


    document.getElementById("tth3").innerHTML = talent.nombre
    document.getElementById("ttp").innerHTML = talent.texto
    document.getElementById("tooltip").style.display = "inline"
}

hideTooltip = () => {
    document.getElementById("tooltip").style.display = "none"
}

var testing = {
    nombre: "nombre",
    tipo: "talento",
    numeros: 1234,
    id: "una id",
    run: function() {
        console.log("executing")
        addToArray(this)
    }
}




var  talents = [
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
    prereqs: [3, "0001"],
    onBuy: function() {
        buyTalent(this)
    },
    onClick: function() {
        shareEmbed(this)
    }
    },
]

generateButtons()