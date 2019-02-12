$('#confirm-update').modal({
    closable: false,
    transition: 'fade up',
    onDeny:   function(){
                if(document.getElementById('confirmUpdate').classList.contains('loading'))
                    return false
            },
    onHide: function(){
        document.getElementById('confirmUpdate').classList.remove('loading','disabled')
    }
})
$('#formCiudad').modal({
    transition: 'fade up',
    closable: false, 
    onDeny:   function(){
                if(document.getElementById('addBtn').classList.contains('loading'))
                    return false
            },
    onHide: function(){
        document.getElementById('addBtn').classList.remove('loading','disabled')
    }
})
$('#formImage').modal({
    transition: 'fade up',
    closable: false, 
    onDeny:   function(){
                if(document.getElementById('addImageBtnF').classList.contains('loading'))
                    return false
            },
    onHidden: function(){
        document.getElementById('addImageBtnF').classList.remove('loading','disabled')
        document.getElementById('inputFile').value = ""
        document.getElementById('imgFile').src="/imgs/admin/no-image.png"
        document.getElementById('imgName').innerHTML = "Agregar imagen"
        document.getElementById('valueInput').value = 0;
        document.getElementById('tags').innerHTML = ""
    }
})


document.getElementById('addCity').onclick = function(){
    $('#formCiudad').modal('show');
}

document.getElementById('addImageBtn').onclick = function(){
    $('#formImage').modal('show')
}
document.getElementById('img-div').onclick = function(){
    document.getElementById('inputFile').click()
}


/**
 * Para hacer que los elementos puedan ser seleccionados para eliminación,
 * hace que les aparezca el checkbox. También hace la función de cancelar 
 * la selección.
 */
document.getElementById('selectMultiBtn').onclick = function(){
    let funcion = this.classList.contains('selected')? true: false;
    let cards = document.getElementsByClassName('card')
    let checks = document.getElementsByClassName('check-input')
    let position = document.getElementsByClassName('position')
    changeStateButtons('selectMultiBtn', !funcion)
    if(!funcion){
        for (let x = 0; x < cards.length; x++) {
            checks[x].parentElement.style.display = 'inline-block'
            position[x].style.display = 'none'
            if(typeof buttons[x] !== 'undefined' && buttons[x].id != 'selectMultiBtn'){
                buttons[x].classList.add('disabled')
            }
        }
        this.classList.add('selected')
        this.firstElementChild.classList.remove('tasks')
        this.firstElementChild.classList.add('close')
        this.firstElementChild.nextSibling.textContent = "Cancelar selección"
        document.getElementById('eliminarImagesBtn').style.display = "inline-block"
    }
    else{
        for (let x = 0; x < cards.length; x++) {
            checks[x].parentElement.style.display = 'none'
            checks[x].checked = false
            position[x].style.display = 'inline-block'
        }
        
        this.classList.remove('selected')
        this.firstElementChild.classList.remove('close')
        this.firstElementChild.classList.add('tasks')
        this.firstElementChild.nextSibling.textContent = "Seleccionar elementos"
        document.getElementById('eliminarImagesBtn').style.display = "none"
    }
    document.getElementById('eliminarImagesBtn').classList.remove('disabled')
}

/**
 * Solamente deshabilita o habilita los botones de la página
 * @param {*} idException 
 * @param {*} state Recibe falso para bloquearlos y true para dejarlos activos
 */
function changeStateButtons(idException, state){
    buttons = document.getElementsByTagName('button')
    //Para desactivar los botones
    if(state)
        for (let x = 0; x < buttons.length; x++)
            buttons[x].id != idException? buttons[x].classList.add('disabled'):''
    else
        for (let x = 0; x < buttons.length; x++)
            buttons[x].id != idException? buttons[x].classList.remove('disabled'):''
}

let cityToUpdate; //Esta variable sirve para actualizar la ciudad.
/**
 * Actualiza la página según la modalidad
 * @param {Number} mode Tipo de modalidad: 1.-Por región 2.-Global 3.-Ambas
 */
function changeMode(mode){
    document.getElementById('cards').innerHTML = "";
    document.getElementById('cargando').classList.add('active');
    const url = (mode == 1 ? '/images/getCities': '/images/getImagesGlobal');
    getData(url, function(res){
        if(res.success){
            let porRegionBtn = document.getElementById('porRegion');
            let globalBtn = document.getElementById('global');
            if(mode == 2){
                porRegionBtn.classList.remove('active')
                globalBtn.classList.add('active')
                document.getElementById('toolsImages').style.display = 'inline-block'
                printImagesM2(res.images)
            }
            else{
                globalBtn.classList.remove('active')
                porRegionBtn.classList.add('active')
                document.getElementById('toolsImages').style.display = 'none'
                res.cities.mode = mode;
                printCities(res.cities)
            }
        }
        else{
            document.getElementById('modal-text').innerHTML = response.msg;
            $('#error-modal').modal('show');
        }
    });
}

/**
 * Devuelve información de la url
 * @param {String} url Url de donde se va a obtener a información
 * @param {Number} option Tipo de modalidad: 1.-Por región 2.-Global
 */
function getData(url, callback){
    let loader = document.getElementById('cargando');
    const Http = new XMLHttpRequest();
    Http.open("GET", url, true);
    Http.setRequestHeader('Content-type', 'application/json');
    Http.onreadystatechange = function(){
        loader.className = loader.className.replace(/\bactive\b/g, "");
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            const response = JSON.parse(Http.response);
            callback(response);
        }
        
        else if(this.readyState == XMLHttpRequest.DONE){
            document.getElementById('modal-text').innerHTML = "Error en la conexión al servidor."
            $('#error-modal').modal('show');
        }
    }
    Http.send();   
}
/**
 * Esta función agrega la ciudad.
 */
function addCity(){
    const inputs = [
        document.getElementById('cityInput'),
        document.getElementById('stateInput'),
        document.getElementById('countryInput'),
    ]
    if(validateForm(inputs))
        return false;
    document.getElementById('addBtn').classList.add('loading','disabled')
    const data = {
        City :document.getElementById('cityInput').value,
        State: document.getElementById('stateInput').value,
        Country: document.getElementById('countryInput').value
    } 
    let http = new  XMLHttpRequest();
    http.open("POST", "/images/addCity", true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
            const result = JSON.parse(this.response);
            if(result !== "" && result.success){
                closeForm()
                const mode = document.getElementById('porRegion').classList.contains('active') ? 1 : 2;
                changeMode(mode)
            }
            else if(result!== "" && !result.siccess){
                document.getElementById('modal-text').innerHTML = result.msg;
                $('#error-modal').modal('show');
            }
        }
        else if(this.readyState == XMLHttpRequest.DONE){
            document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
            $('#error-modal').modal('show');
        }
    }
    http.send(JSON.stringify(data));
}
/**
 * Actualiza la modalidad de la ciudad
 */
function updateModeCity(){
    document.getElementById('confirmUpdate').classList.add('loading','disabled')
    let http = new XMLHttpRequest()
    http.open('PUT', 'images/updateCityMode')
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
            const mode = document.getElementById('porRegion').classList.contains('active') ? 1 : 2;
            changeMode(mode)
        }
        else if(this.readyState == XMLHttpRequest.DONE){
            document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
            $('#error-modal').modal('show');
        }
    }
    http.send(JSON.stringify(cityToUpdate))
}

/**
 * it just clears the form
 */
function closeForm(){  
    document.getElementById('cityInput').value = "";
    document.getElementById('stateInput').value = "";
    document.getElementById('countryInput').value = "";
    document.getElementById('cityInput').parentElement.classList.remove('error');
    document.getElementById('stateInput').parentElement.classList.remove('error');
    document.getElementById('countryInput').parentElement.classList.remove('error');
    document.getElementById('addBtn').classList.remove('loading','disabled') 
    $('#formCiudad').modal('hide');
}
/**
 * Valida que el form esté lleno, les agrega la clase error si estan vacios 
 * @param {Array} inputs 
 */
function validateForm(inputs = []){
    let hasError = false
    for(var property in inputs){
        if (inputs.hasOwnProperty(property) && inputs[property].value == "") {
            inputs[property].parentElement.classList.add("error")
            hasError = true;
        }
        else{
            inputs[property].parentElement.classList.remove("error")
        }
    }
    return hasError
}

/**
 * Imprime las ciudades
 * @param {Object} data 
 */
function printCities(data){
    let cards = "";
    data.forEach(element => {
        const images = data.mode == 1? element.ImagesM1 : element.ImagesM2;
        cards += `
        <div class="ui card">
            <a href="/images/cities/${element._id}">
                <div class="image">
                    <img src="${images.length > 0? images[0].URL: '/imgs/admin/no-image.png'}">
                </div>
                <div class="content">
                    <a class="header">
                        ${element.City}
                    </a>
                    <div class="meta">
                        <span class="date">
                            ${element.State}, ${element.Country}
                        </span>
                    </div>
                </div>
                <div class="extra content">
                    <a>
                       <i class="picture icon"></i>
                        ${images.length} ${images.length != 1? " Imágenes": " Imágen"}
                    </a>
                </div>
            </a>
        </div>
        `
    });
    document.getElementById('cards').innerHTML = cards;
}
    /**
 * Imprime las imagenes de la modalidad global
 * @param {Object} data 
 */
function printImagesM2(data){
    let cards = "";
    data.forEach(function(element, index){
        let imagen = JSON.stringify(element).replace(/ /g, "♀");
        cards += `<div class="ui card" onclick=clickImage('${element.URL}',${index},${imagen});>
                    <div class="ui checkbox">
                        <input class="check-input" id="checkId${index}" data-imageId="${element._id}" type="checkbox" />
                    <label></label>
                    </div>
                    <div class="card-content">
                        <div class="position">${index+1}</div>
                        <div class="image"><img src='${element.URL}' onerror="this.src='/imgs/admin/no-image.png'"/></div>
                        <div class="extra content"><i class="picture icon"></i>${typeof element.Value!=='undefined'?element.Value:'0'} ${element.Value == 1?' Punto':' Puntos'}</div>
                    </div>
                </div>`
    });
    document.getElementById('cards').innerHTML = cards
}

 /**
     * 
     * @param {*} url Image url
     * @param {*} check Check id vaue
     */
    function clickImage(url, check, element){
        element = JSON.stringify(element)
        element = JSON.parse(element.replace(/♀/g, " "))
        let selectMultiBtn = document.getElementById('selectMultiBtn')
        if(!selectMultiBtn.classList.contains('selected')){
            document.getElementById('detail-name').innerHTML = "ID: "+element.id
            document.getElementById('detail-points').innerHTML = "Puntaje: "+element.Value
            let respuestas = "";
            (element.Answers).forEach(function(element){
                respuestas += `<a class="ui label disabled">${element}</a>`
            })
            document.getElementById('detail-tags').innerHTML = respuestas
            document.getElementById('imgInModal').src = url
            $('#image-modal').modal('show')
        }
        else{
            check = document.getElementById('checkId'+check)
            check.checked = !check.checked;
        }
    }

    function deleteButton(){
        let checks = document.querySelectorAll('.check-input:checked')
        console.log(checks)
         let toDeleteIds = [];
        checks.forEach(function(element){
            toDeleteIds.push(element.getAttribute('data-imageid'))
        })
        console.log(toDeleteIds)
        document.getElementById('deleteBtn').classList.add('loading')
        http = new XMLHttpRequest()
        data = {ids: toDeleteIds}
        http.open("DELETE", "/images/deleteImagesM2", true);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                response = JSON.parse(this.response)
                if(response.success){
                    document.getElementById('success-title').innerHTML = "Eliminación éxitosa"
                    document.getElementById('modal-success-text').innerHTML = "Las imagenes se han eliminado correctamente."
                    $('#success-modal').modal('show')
                    changeMode(2)
                }
                else{
                    document.getElementById('error-title').innerHTML = "Error";
                    document.getElementById('modal-text').innerHTML = "No se han podido eliminar las imágenes.";
                    $('#error-modal').modal('show')
                }
            }
            else if(this.readyState == XMLHttpRequest.DONE){
                document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
                $('#error-modal').modal('show')
            }
            document.getElementById('selectMultiBtn').click()
            document.getElementById('deleteBtn').classList.remove('loading')
        }
        http.send(JSON.stringify(data))
    }
    function showModal(){
        if(document.querySelectorAll('input:checked').length > 0){
            $('#delete-modal').modal('show')
        }
        else{
            document.getElementById('error-title').innerHTML = "Error";
            document.getElementById('modal-text').innerHTML = "Debe seleccionar al menos una imagen.";
            $('#error-modal').modal('show')
        }
    }

    /**
     * Agrega la imagen
     */
    function addImage(){    
        let valueInput = document.getElementById('valueInput')
        hasError = false
        if(valueInput.value < 0 || valueInput.value == ""){
            valueInput.parentElement.classList.add("error")
            hasError = true
        }
        if(document.getElementById('tags').childElementCount == 0){
            document.getElementById('tags').parentElement.classList.add('error')
            hasError = true
        }
        if(document.getElementById('inputFile').value == ""){
            document.getElementById('imgName').style.color = '#9f3a38';   
            hasError = true
        }
        if(hasError)
            return
        document.getElementById('addImageBtnF').classList.add('loading','disabled')
        const tagsElements = document.getElementById('tags').getElementsByTagName('a')
        let respuestas = "" 
        for (let item of tagsElements) {
            respuestas += (item.innerText).trim()+";";
        }
        let form = document.getElementById('addImageForm')
        let formData = new FormData()
        formData.append('imagen', document.getElementById('inputFile').files[0]);
        formData.append('puntuacion', form[2].value);
        formData.append('respuestas', respuestas);
        formData.enctype="multipart/form-data"

        let http = new  XMLHttpRequest();
        http.open("PUT", "/images/addImageM2", true);
        
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                response = JSON.parse(this.response)
                if(response.success){
                    document.getElementById('success-title').innerHTML = "Imagen agregada"
                    document.getElementById('modal-success-text').innerHTML = "La imagen se ha agregado correctamente."
                    $('#success-modal').modal('show')
                    changeMode(2);
                }
                else if(!response.success){
                    document.getElementById('error-title').innerHTML = "Error";
                    document.getElementById('modal-text').innerHTML = "No se pudo agregar la ciudad.";
                    $('#error-modal').modal('show')
                }
            }
            else if(this.readyState == XMLHttpRequest.DONE){
                document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
                $('#error-modal').modal('show')
            }
        }
        http.send(formData)
        
    }

    /**
     * Crea los tags cuando ingresa ';'
     * @param {Event} e 
     */
    function checkForTag(e){
        let tagsDiv = document.getElementById('tags')
        let answers = document.getElementById('answers')
        if (e.keyCode == 59 && answers.value !== "" && tagsDiv.childElementCount < 3) {
            tagsDiv.innerHTML +=    `<a class="ui label">
                                        ${answers.value}
                                        <i class="delete icon" onclick="this.parentElement.remove()"></i>
                                    </a>` 
            answers.value = ""
            return false
        }
    }

    document.getElementById('inputFile').onchange = function(){
        document.getElementById('imgName').style.color = 'black';
        let file = document.getElementById('inputFile').files[0];
        let reader = new FileReader();
        let imgElem = document.getElementById('imgFile')
        let fileName = document.getElementById('imgName')
        reader.onload = function(e) {
            imgElem.src = e.target.result;
            fileName.innerHTML = file.name;
       }
       reader.readAsDataURL(file);
    }