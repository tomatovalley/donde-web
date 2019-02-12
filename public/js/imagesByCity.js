    $('.button').popup()
    $('.ui.checkbox').checkbox()
    let deleteOption = -1 // 1 for city, 2 for images
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

    $('#delete-modal').modal({
        onShow: function(){
            if(deleteOption == 1){
                document.getElementById('delete-textTitle').innerHTML = '<i class="trash icon"></i>¿Seguro que desea eliminar la información de la ciudad?'
                document.getElementById('delete-text').innerText = 'Toda la información perteneciente a la ciudad será eliminada.'
            }
            else{
                document.getElementById('delete-textTitle').innerHTML = '<i class="trash icon"></i>¿Seguro que desea eliminar las imagenes seleccionadas?'
                document.getElementById('delete-text').innerText = 'Las imagenes seleccionadas serán removidas de manera permamente.'
            }
        }
    })
    //$('#delete-modal').modal()

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

    document.getElementById('editCity').onclick = function(){
        $('#formCiudad').modal('show')
    }

    document.getElementById('addImageBtn').onclick = function(){
        $('#formImage').modal('show')
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
     * 
     * @param {*} url Image url
     * @param {*} check Check id vaue
     */
    function clickImage(url, check, element){
        if(typeof element == 'string'){
            element = JSON.parse(element.replace(/♀/g, " "))
        }''
        let selectMultiBtn = document.getElementById('selectMultiBtn')
        //let switchBtn = document.getElementById('selectSwitchBtn')
        if(!selectMultiBtn.classList.contains('selected')/* && !switchBtn.classList.contains('selected')*/){
            document.getElementById('detail-name').innerHTML = "ID: "+element.id
            document.getElementById('detail-points').innerHTML = "Puntaje: "+element.Value
            console.log(element.Tags)
            let respuestas = "";
            (element.Tags).forEach(function(element){
                respuestas += `<a class="ui label disabled">${element}</a>`
            })
            document.getElementById('detail-tags').innerHTML = respuestas
            document.getElementById('imgInModal').src = url
            $('#image-modal').modal('show')
        }
        /* else if(switchBtn.classList.contains('selected')){
            let selectedCards = document.getElementsByClassName('card-switch')
            if(selectedCards.length < 1){
                if(element.classList.contains('card-switch'))
                    element.classList.remove('card-switch')    
                else{
                    element.classList.add('card-switch')
                }
            }
            else{
                let selectedCard = document.getElementsByClassName('card-switch')[0]     
                let aux = selectedCard.getElementsByClassName('card-content')[0].cloneNode(true)
                console.log(aux)
            }

        } */
        else{
            check = document.getElementById('checkId'+check)
            check.checked = !check.checked;
        }
    }

    function editCity(){
        const inputs = [
            document.getElementById('cityInput'),
            document.getElementById('stateInput'),
            document.getElementById('countryInput'),
        ]
        if(validateForm(inputs))
            return false
        document.getElementById('addBtn').classList.add('loading','disabled')
        const data = {
            _id: city._id,
            City :document.getElementById('cityInput').value,
            State: document.getElementById('stateInput').value,
            Country: document.getElementById('countryInput').value
        }
        let http = new  XMLHttpRequest();
        http.open("PUT", "/images/editCity", true);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                const result = JSON.parse(this.response)
                if(result !== "" && result.success){
                    document.getElementById('success-title').innerHTML = "Ciudad modificada"
                    document.getElementById('modal-success-text').innerHTML = "La ciudad se ha modificado correctamente."
                    $('#success-modal').modal('show')
                    document.getElementById('cityName').innerHTML = data.City
                    document.getElementById('cityStateCountry').innerHTML = data.State,", ",data.Country
                }
                //Ya existe la ciudad y pide confirmación para actualizar la modalidad.
                else if(result !== "" && result.errorCode == 101){
                    document.getElementById('error-title').innerHTML = "Ciudad existente";
                    document.getElementById('modal-text').innerHTML = "Ya existe una ciudad con los mismos datos.";
                    $('#error-modal').modal('show')

                    cityToUpdate = result.city[0];
                    cityToUpdate.Mode = data.Mode;
                }
                else{   
                    document.getElementById('modal-text').innerHTML = "Error.";
                    document.getElementById('modal-text').innerHTML = "Algo ha sucedido, por favor intentelo de nuevo.";
                    $('#error-modal').modal('show')
                }
            }
            else if(this.readyState == XMLHttpRequest.DONE){
                document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
                $('#error-modal').modal('show')
            }
        }
        http.send(JSON.stringify(data))
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
        if(document.getElementById('cards').childNodes.length == 0){
            formData.append('Active', true)
        }
        else{
            formData.append('Active', false)
        }
        formData.append('imagen', document.getElementById('inputFile').files[0]);
        formData.append('puntuacion', form[2    ].value);
        formData.append('respuestas', respuestas);
        formData.append('city', city._id)
        formData.enctype="multipart/form-data"

        let http = new  XMLHttpRequest();
        http.open("PUT", "/images/addImageInCity", true);
        
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                response = JSON.parse(this.response)
                if(response.success){ 
                    document.getElementById('success-title').innerHTML = "Imagen agregada"
                    document.getElementById('modal-success-text').innerHTML = "La imagen se ha agregado correctamente."
                    $('#success-modal').modal('show')
                    getImages()
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
     * Unicamente filtra las imagenes dependiendo del valor seleccionado en el select 'modalidad'
     * 1: Answered = false
     * 2: Answered = true
     */
    function filterImages(){
        let mode = document.getElementById('filtro').value
        let elements = []
        if(mode == 1){
            (city.ImagesM1).forEach(function(element){
                if(element.Answered == false)
                    elements.push(element)
            })
        }
        else if(mode == 2){
            (city.ImagesM1).forEach(function(element){
                if(element.Answered == true)
                    elements.push(element)
            })
        }
        printImages(elements)
    }
    /**
     * Impre la información
     * @param {*} data Información a imprimir
     * @param {*} option Si recibe 1 limpiará el div de las cards
     */
    function printImages(data, option){
        let cards = document.getElementById('cards')
        if(option != 1)
            cards.innerHTML = ""
        let card = ""
        let answered = document.getElementById('filtro').value == 1? false : true
        data.forEach(function(image, index) {
            if(answered == image.Answered){
                let imagen = JSON.stringify(image).replace(/ /g, "♀");
                if(typeof image.score !== undefined){
                    card += `<div class="ui card" onclick=clickImage('${image.URL}',${index},${imagen});>
                                <div class="ui checkbox">
                                    <input class="check-input" id="checkId${index}" data-imageId="${image.id}" type="checkbox" />
                                <label></label>
                                </div>
                                <div class="card-content">
                                    <div class="position">${index+1}</div>
                                    <div class="image"><img src='${image.URL}' onerror="this.src='/imgs/admin/no-image.png'"/></div>
                                    <div class="extra content"><i class="picture icon"></i>${typeof image.Value!=='undefined'?image.Value:'0'} ${image.Value == 1?' Punto':' Puntos'}</div>
                                </div>
                            </div>`
                }
            }
        });
        cards.innerHTML = card;
        
    }
    /**
     * Crea los tags cuando ingresa ';'
     * @param {Event} e 
     */
    function checkForTag(e){
        let tagsDiv = document.getElementById('tags')
        let answers = document.getElementById('answers')
        if (e.keyCode == 59 && answers.value !== "") {
            tagsDiv.innerHTML +=    `<a class="ui label">
                                        ${answers.value}
                                        <i class="delete icon" onclick="this.parentElement.remove()"></i>
                                    </a>` 
            answers.value = ""
            return false
        }
    }
    /**
     * Hace que puedas cambiar los cards de posición.
     */
    function makeCardsSwitchable(){
        let button = document.getElementById('selectSwitchBtn')
        let dimmers = document.getElementsByClassName('div-dimmer')
        let funcion = button.classList.contains('selected')
        changeStateButtons('selectSwitchBtn', !funcion)
        if(!funcion){
            button.classList.add('selected')
            $('.ui.card').dimmer({closable: false}).dimmer('show');
        }
        else{
            cardsToSwitch = document.getElementsByClassName('card-switch')
            for (let x = 0; x < cardsToSwitch.length; x++) {
                cardsToSwitch[x].classList.remove('card-switch');
            }
            button.classList.remove('selected')
            $('.ui.card').dimmer('hide');
        }

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
    /**
     * Obtiene las imagenes de la ciudad.
     */
    function getImages(){
        http = new XMLHttpRequest()
        http.open("GET", "/images/"+city._id+"/getImagesInCity", true);
        
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                response = JSON.parse(this.response)
                if(response.success){
                    city.ImagesM1 = response.city
                    printImages(response.city, 1)
                }
            }
            else if(this.readyState == XMLHttpRequest.DONE){
                document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
                $('#error-modal').modal('show')
            }
        }
        http.send()
    }
    
    /**
     * Función del botón de delete del modal, sirve para eliminar ya sea la ciudad o imagenes
     * Utiliza la variable global 'deleteOption' con los siguientes valores.
     *  1: para eliminar la ciudad.
     *  2: para eliminar imagenes.
     **/
    function deleteButton(){
        if(deleteOption == 1){
            document.getElementById('deleteBtn').classList.add('loading')
            http = new XMLHttpRequest()
            http.open("DELETE", "/images/deleteCity", true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onreadystatechange = function(){
                if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                    response = JSON.parse(this.response)
                    if(response.success){
                        document.getElementById('success-title').innerHTML = "Eliminación éxitosa"
                        document.getElementById('modal-success-text').innerHTML = "La ciudad se ha correctamente."
                        $('#success-modal').modal('show')
                        $('#success-modal').modal({onHidden: function(){
                            window.location.replace('http:/images')
                        }})
                    }
                }
                else if(this.readyState == XMLHttpRequest.DONE){
                    document.getElementById('modal-text').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
                    $('#error-modal').modal('show')
                }
                document.getElementById('selectMultiBtn').click()
                document.getElementById('deleteBtn').classList.remove('loading')
            }
            http.send(JSON.stringify({city_id: city._id}))
        }
        else if(deleteOption == 2){
            let checks = document.querySelectorAll('.check-input:checked')
            let toDeleteIds = [];
            document.getElementById('deleteBtn').classList.add('loading')
            checks.forEach(function(element){
                toDeleteIds.push(element.getAttribute('data-imageid'))
            })
            http = new XMLHttpRequest()
            data = {ids: toDeleteIds}
            http.open("PUT", "/images/"+city._id+"/deleteImagesM1", true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onreadystatechange = function(){
                if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                    response = JSON.parse(this.response)
                    if(response.success){ 
                        document.getElementById('success-title').innerHTML = "Eliminación éxitosa"
                        document.getElementById('modal-success-text').innerHTML = "Las imagenes se han eliminado correctamente."
                        $('#success-modal').modal('show')
                        getImages()
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
    }