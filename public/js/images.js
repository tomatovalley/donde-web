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
document.getElementById('addCity').onclick = function(){
    $('#formCiudad').modal('show');
}

let cityToUpdate; //Esta variable sirve para actualizar la ciudad.
/**
 * Actualiza la página según la modalidad
 * @param {Number} mode Tipo de modalidad: 1.-General 2.-Específica 3.-Ambas
 */
function refreshCities(mode){
    document.getElementById('cards').innerHTML = "";
    document.getElementById('cargando').classList.add('active');
    const url = '/images/getCitiesByModality/';
    getCities(url, mode, function(res){
        if(res.success){
            let generalBtn = document.getElementById('general');
            let specificBtn = document.getElementById('specific');
            if(mode == 2){
                generalBtn.classList.remove('active')
                specificBtn.classList.add('active')
            }
            else{
                specificBtn.classList.remove('active')
                generalBtn.classList.add('active')
            }
            res.cities.mode = mode;
            printCities(res.cities)
        }
        else{
            document.getElementById('modal-text').innerHTML = response.msg;
            $('#error-modal').modal('show');
        }
    });
}

/**
 * 
 * @param {String} url Url de donde se va a obtener a información
 * @param {Number} option Tipo de modalidad: 1.-General 2.-Específica 3.-Ambas
 */
function getCities(url, option, callback){
    let loader = document.getElementById('cargando');
    const Http = new XMLHttpRequest();
    Http.open("GET", url+option, true);
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
        document.getElementById('selectMode')
    ]
    if(validateForm(inputs))
        return false;
    document.getElementById('addBtn').classList.add('loading','disabled')
    const data = {
        City :document.getElementById('cityInput').value,
        State: document.getElementById('stateInput').value,
        Country: document.getElementById('countryInput').value,
        Mode: document.getElementById('selectMode').value,
    } 
    let http = new  XMLHttpRequest();
    http.open("POST", "/images/addCity", true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
            const result = JSON.parse(this.response);
            if(result !== "" && result.success){
                closeForm()
                const mode = document.getElementById('general').classList.contains('active') ? 1 : 2;
                refreshCities(mode)
                /* 
                document.getElementById('modal-success-text').innerHTML = result.msg;
                $('#success-modal').modal('show'); */
            }
            //Ya existe la ciudad y pide confirmación para actualizar la modalidad.
            else if(result !== "" && result.errorCode == 101){
                closeForm();
                document.getElementById('modal-text-confirm').innerHTML = result.msg+`<br><br>Configuración anterior: <b>${document.getElementById('selectMode').options[result.city[0].Mode-1].text}</b><br>Nueva configuración: <b>${document.getElementById('selectMode').options[data.Mode-1].text}</b>`;
                $('#confirm-update').modal('show');

                cityToUpdate = result.city[0];
                cityToUpdate.Mode = data.Mode;
            }
            else{   
                closeForm();
                document.getElementById('modal-text').innerHTML = "Algo ha sucedido, por favor intentelo de nuevo.";
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
            const mode = document.getElementById('general').classList.contains('active') ? 1 : 2;
            refreshCities(mode)
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
            <a href="/images/${element._id}">
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
