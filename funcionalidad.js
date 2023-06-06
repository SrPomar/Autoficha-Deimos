webhook = (content, ...embeds) => { 
    var mensaje = {
        content: content,
        username: personaje.nombre,
        type: 1,
        channel_id: 1080818641488056370,
        avatar_url: personaje.avatar,
    }

    if (embeds != null) {
        mensaje.embeds = embeds
    }
    axios({
        method: "post",
        url: "https://discord.com/api/webhooks/1080819831642800188/s3TvTg9sdCqHrU3nnl6d7GTy7lk8ah7UCCzLas6XxlXw5aH8SX_43FYBtCVougz2MlGg",
        data: mensaje
    })

}

backupChar = () => {
    var spacedString = personaje
    console.log(spacedString)
    spacedString.avatar += " "
    console.log(spacedString.avatar)
    var embed = {
        title: "Copia de seguridad de " + personaje.nombre,
        description: JSON.stringify(spacedString),
        thumbnail: {url: personaje.avatar}
    }
    webhook("", embed)
}

importChar = () => {
    var imported = JSON.parse(prompt("Introduce el JSON con la copia de seguridad de tu personaje"))
    imported.avatar = imported.avatar.trim()
    if (imported != null) {personaje = imported}
    updateView()
}

startupLoader = () => {
    if (localStorage.getItem("personaje") != null) {
        personaje = JSON.parse(localStorage.getItem("personaje"));
        console.log("Se ha importado a "+personaje.nombre+" desde almacenamiento local")
        console.log(personaje)
    }

    else {
        var input = prompt("No se ha encontrado ningún personaje en almacenamiento local. Pega aquí tu copia de seguridad o cancela para crear un personaje nuevo")
        if (input != null) {
            personaje = JSON.parse(input)
        }
        if (confirm("¿Deseas guardar el personaje en almacenamiento local?")) {
            localStorage.setItem("personaje", JSON.stringify(personaje))
        }
    };
   updateView()

};

lanzarDados = (atributo, habilidad, ...extras) => {
    /* EXTRAS[], in order:
        0: trigger (string)
        1: dados extra (int)
        2: éxitos extra (int)
        3: embeds (object)
    
    */ 
    var dados = atributo[0] + atributo[1]
    if (extras[1] != null) {
        dados += extras[1]
    }

    var exitos = 0
    if (extras[2] != null) {
        exitos += extras[2]
    }

    var resultado = []

    for (i = 0; i < dados; i++) {
        var target = habilidad[0]+habilidad[1]
        if (target > 5) {target =5}
        resultado.push(Math.floor((Math.random() * 6) +1));
        if (resultado[i] <= target) {
            exitos++;
        }
    }

    var mensaje = "**"+personaje.nombre+"**" + " ha realizado una tirada de " + extras[0] + " ("+target+ "-) \n Resultado: **"+exitos+" éxitos** " + "\n" + "( "+resultado+" )"
    
    if (extras[3] != null) {
        webhook(mensaje, extras[3])
    }
    else {
        webhook(mensaje)
    }
}

addToArray = (object) => {
    if (object < 3) {
        let input = prompt("Introduce el nuevo elemento")
    
        if (input != "" && input != null) {
            if (object == 0) { //0 jergas
                personaje.jergas.push(input)
            }
            if (object == 1) { //1 especializaciones
                personaje.especializaciones.push(input)
            }
            if (object == 2) { //2 inventario
                personaje.inventario.push(input)
            }
        }
    } // anything else gets proper object treatment
    else if (object.tipo == "talento" || object.tipo == "arquetipo") {
        personaje.talentos.push(object.id)
    }
    else if (object.tipo == "item") {
        personaje.inventario.push(object)
    }
}


statUp = (trigger) => {
    let coste = ((trigger +1) * 2) + 1 //el doble del nivel que se desea adquirir, +1
    
    if (coste > personaje.exp[0]) {
        alert("No puedes mejorar este atributo, necesitas "+coste+" puntos de experiencia y solo tienes "+personaje.exp[0])
    } 
    else {
        if (confirm("Mejorar este atributo al nivel "+(trigger+1)+" cuesta "+coste+" exp. \n Esto no se puede deshacer.")) {
            personaje.exp[0] = personaje.exp[0] - coste
            trigger ++
        }
    }
    return trigger
}

skillUp = (trigger) => {
    let coste = (trigger +2) //el nivel que se desea adquirir, +1
    
    if (coste > personaje.exp[0]) {
        alert("No puedes mejorar esta habilidad, necesitas "+coste+" puntos de experiencia y solo tienes "+personaje.exp[0])
    } 
    else {
        if (confirm("Mejorar esta habilidad al nivel "+(trigger+1)+" cuesta "+coste+" exp. \n Esto no se puede deshacer.")) {
        personaje.exp[0] = personaje.exp[0] - coste
        trigger ++
        }
    }
    return trigger
}

buyTalent = (object) => { //Comprueba que el personaje tenga los recursos suficientes para adquirir el talento o habilidad del arquetipo
    if (object.coste == "☆") {
        if (personaje.mvpp[0] > 0) {
            if (confirm("¿Deseas adquirir "+object.nombre+"?")) {
                personaje.mvpp[0] --
                addToArray(object) //addToArray gestiona la lógica de saber en qué array debería ir
                if (object.tipo == "arquetipo") {personaje.arquetipo[0]++}
                updateView()
                return true
            }
        }
        else {alert("No puedes permitirte esto, no te quedan ☆")}
        return false
    }

    else {
        if (object.coste <= personaje.exp[0]) {
            if (confirm("¿Deseas adquirir "+object.nombre+"? \n Este talento cuesta "+object.coste+" puntos de experiencia"))
            personaje.exp[0] = personaje.exp[0] - object.coste
            addToArray(object)
            updateView()
            return true
        }
        else {alert("No puedes permitirte este talento, cuesta "+object.coste+" puntos de experiencia y solo te quedan "+personaje.exp)}
        return false
    }
}

changeCredits = () => {
    let input = prompt ("Introduce la cantidad de créditos que quieras sumar.")
    if (input != "" && input != null) {
        input = parseInt(input)
        personaje.inventario[0] += input
        document.getElementById("inventario").rows[1].cells[1].innerHTML = "<b>"+personaje.inventario[0]+"</b>"
    }
}

boldStats = () => { //Bolds numbers in statblock tables
    var currentskill = 0; //counter for later, as skills are not directly connected to stats in the code so the only way is to know how many we checked already
    for (i = 0; i < Object.entries(personaje.atr).length; i++) { // for each stat
        var statnum = Object.entries(personaje.atr)[i][1][0];
        var statname = Object.entries(personaje.atr)[i][0];

        for (j = 1; j <= statnum; j++) { // Changes numbers to bold in stat table
            document.getElementById((statname+"tab")).rows[0].cells[j].innerHTML = '<b>'+j+'</b>'
        }

        if (statname != "ref" && statname != "fis" && statname != "vol") {var skillcount = 4}
        else {var skillcount = 3}

        for (k = 0; k < skillcount; k++) { // Changes numbers to bold in skills table
            var skillnum = Object.entries(personaje.hab)[currentskill][1][0];
            currentskill ++;
        
            for (l = 1; l <= skillnum; l++) {
                document.getElementById((statname+"skills")).rows[k].cells[l].innerHTML = '<b>'+l+'</b>'
            }
        }
    }
}

disableButtons = () => {
    // deshabilitar StatUps
    for (i = 0; i < Object.entries(personaje.atr).length; i++) {
        if (Object.entries(personaje.atr)[i][1][0] == 7) {
            document.getElementById("buy"+Object.entries(personaje.atr)[i][0]).disabled = true;
        }
    }

    // deshabilitar SkillUps
    for (i = 0; i < Object.entries(personaje.hab).length; i++) {
        if (Object.entries(personaje.hab)[i][1][0] == 5) {
            document.getElementById("buy"+Object.entries(personaje.hab)[i][0]).disabled = true;
        }
    }
}

setRS = () => {
    // Derivated resource calculation
    personaje.sec.heridas[0] = personaje.atr.fis[0]+personaje.atr.fis[1]+3
    personaje.sec.estres[0] = personaje.atr.vol[0]+personaje.atr.vol[1]+3


    for (i=0; i <= 2; i++) { // resources
        var values = Object.entries(personaje.sec)[i][1][1].toString() + " / " + Object.entries(personaje.sec)[i][1][0].toString()
        document.getElementById("resources").rows[i].cells[1].innerHTML = values
    }

    document.getElementById("secondaries").rows[0].cells[1].innerHTML = (personaje.sec.velocidad.toString() + " UAM") // movimiento
    document.getElementById("secondaries").rows[1].cells[1].innerHTML = (personaje.sec.vision[0].toString()+ "º "+personaje.sec.vision[1]+ " UAM") // visión
    document.getElementById("secondaries").rows[2].cells[1].innerHTML = (personaje.sec.armadura) // resistencia del traje
}

setPassport = () => {
    document.getElementById("foto").src = personaje.avatar
    document.getElementById("pasaporte").rows[0].cells[2].innerHTML = personaje.nombre
    document.getElementById("pasaporte").rows[1].cells[1].innerHTML = personaje.origen
    document.getElementById("pasaporte").rows[2].cells[1].innerHTML = personaje.ocupacion

    var text = ""
    for (i = 0; i < personaje.jergas.length; i++) { // populate jergas cell
        button = "<button onclick='personaje.jergas.splice("+i+",1); updateView()'>x</button>"
        text = text + personaje.jergas[i] + button + "<br>";
    }
    if (text == "") {text = "(ninguna)"}
    document.getElementById("pasaporte").rows[4].cells[0].innerHTML = text

    text = ""
    for (i = 0; i < personaje.especializaciones.length; i++) { //populate especializaciones cell
        button = "<button onclick='personaje.especializaciones.splice("+i+",1); updateView()'>x</button>"
        text += personaje.especializaciones[i]+ button +"<br>"
    }
    if (text == "") {text = "(ninguna)"}
    document.getElementById("pasaporte").rows[4].cells[1].innerHTML = text
}

setInventory = () => {
    var text = ""
    if (personaje.inventario.length > 1) { //completely unnecessary if, fuck it.
        for (i = 1; i <= personaje.inventario.length; i++) { // Populate inventario cell
            button = "<button onclick='personaje.inventario.splice("+i+",1); updateView()'>x</button>"
            if (typeof personaje.inventario[i] == "string") {
                text += personaje.inventario[i] + button + "<br>"
            }
            else if (typeof personaje.inventario[i] == "object") {
                text += personaje.inventario[i].nombre + button + "<br>"
            }
        }
    }
    if (text == "") {text = "(vacío)"}
    document.getElementById("inventario").rows[2].cells[0].innerHTML = text
}

setDisplay = (id) => {
    let elementList = ["00","01","02","03", "10","11","12","13", "20","21","22","23", "30","31","32","33", "40","41","42", "50","51","52", "60","61","62", "77", "88", "selector", "inventario", "pasaporte", "notas"]

    for (i = 0; i < elementList.length; i++) {
        document.getElementById(elementList[i]).style.display = "none"
    }

    document.getElementById(id).style.display = "block"
}

DisplayReceptacle = (id) => {
    let tabIDs = ["00","01","02","03", "10","11","12","13", "20","21","22","23", "30","31","32","33", "40","41","42", "50","51","52", "60","61","62", "77", "88"]

    for (i = 0; i < tabIDs.length; i++) {
        document.getElementById(tabIDs[i]).style.display = "none"
    }

    document.getElementById(id).style.display = "block"
}

updateView = () => {
    boldStats();
    disableButtons();
    setRS();
    setPassport();
    //receptacleUpdater();
    document.getElementById("estrellas").innerHTML = personaje.mvpp[0]+"☆"
    document.getElementById("xp").value = personaje.exp[0]
    document.getElementById("notas").value = personaje.notas
    document.getElementById("inventario").rows[1].cells[1].innerHTML = "<b>"+personaje.inventario[0]+"</b>"
    setInventory();
    buttonUpdater();
}

setXP = () => {
    var input = parseInt(document.getElementById('xp').value);
    var diferencia = input - personaje.exp[0]

    if (diferencia !=0){
        if (confirm("Vas a modificar tu experiencia disponible en "+diferencia)) {
            personaje.exp[0] = input;
            personaje.exp[1] = personaje.exp[1] + diferencia;
        }
    }
}


changePass = (int) => {
    var input = prompt("¿Nuevo valor?")

    if (input != "" && input != null) {
        if (int == 0) {
            personaje.avatar = input
        }
        if (int == 1) {
            personaje.nombre = input
        }
        if (int == 2) {
            personaje.ocupacion = input
        }
        if (int == 3) {
            personaje.origen = input
        }
    }
    
}


document.getElementById("xp").onchange = () => {setXP()};
document.getElementById("notas").onchange = () => {personaje.notas = document.getElementById("notas").value}

/* var embed = {
    title: "Talento placeholder  <:boblin:622404175719825417>",
    description: "Este talento te permite tirar dos dados más en lanzamientos de Psiónica, solo mientras estés realizando pruebas unitarias o de integración",
    color: 010000200,
    thumbnail: {
        url: "https://as2.ftcdn.net/v2/jpg/02/84/10/59/1000_F_284105979_vQxfX46tZm9fd3XXWYyu9bfnl9ZSIrO4.jpg"
    }
} */


