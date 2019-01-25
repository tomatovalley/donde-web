    $('.button').popup()
    $('.ui.checkbox').checkbox()
    
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
    //$('#delete-modal').modal()

    document.getElementById('delete').onclick = function(){
        $('#delete-modal').modal('show')
    }

    document.getElementById('editCity').onclick = function(){
        $('#formCiudad').modal('show')
    }

    document.getElementById('addImageBtn').onclick = function(){
        document.getElementById('inputFile').click()
        $('#formImage').modal('show')
    }

    document.getElementById('inputFile').onchange = function(){
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
                if(buttons[x].id != 'selectMultiBtn'){
                    buttons[x].classList.add('disabled')
                }
            }
            this.classList.add('selected')
            this.firstElementChild.classList.remove('tasks')
            this.firstElementChild.classList.add('close')
            this.firstElementChild.nextSibling.textContent = "Cancelar selección"
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
        }
    }
    /**
     * 
     * @param {*} url Image url
     * @param {*} check Check id vaue
     */
    function clickImage(url, check, element){
        let selectMultiBtn = document.getElementById('selectMultiBtn')
        let switchBtn = document.getElementById('selectSwitchBtn')
        if(!selectMultiBtn.classList.contains('selected') && !switchBtn.classList.contains('selected')){
            document.getElementById('imgInModal').src = url
            $('#image-modal').modal('show')
        }
        else if(switchBtn.classList.contains('selected')){
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

        }
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
            Country: document.getElementById('countryInput').value,
            Mode: document.getElementById('selectMode').value,
        }
        let http = new  XMLHttpRequest();
        http.open("PUT", "/images/editCity", true);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                const result = JSON.parse(this.response)
                if(result !== "" && result.success){
                    $('#formCiudad').modal('hide')  
                    document.getElementById('success-title').innerHTML = "Ciudad modificada"
                    document.getElementById('modal-success-text').innerHTML = "La ciudad se ha modificado correctamente."
                    $('#success-modal').modal('show')
                    document.getElementById('cityName').innerHTML = data.City
                    document.getElementById('cityStateCountry').innerHTML = data.State,", ",data.Country
                }
                //Ya existe la ciudad y pide confirmación para actualizar la modalidad.
                else if(result !== "" && result.errorCode == 101){
                    $('#formCiudad').modal('hide')
                    document.getElementById('error-title').innerHTML = "Ciudad existente";
                    document.getElementById('modal-text').innerHTML = "Ya existe una ciudad con los mismos datos.";
                    $('#error-modal').modal('show')

                    cityToUpdate = result.city[0];
                    cityToUpdate.Mode = data.Mode;
                }
                else{   
                    $('#formCiudad').modal('hide')
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
     * 
     */
    function addImage(){    
        let valueInput = document.getElementById('valueInput')
        if(valueInput.value < 0 || valueInput.value == ""){
            valueInput.parentElement.classList.add("error")
            return false
        }
        if(document.getElementById('tags').childElementCount == 0){
            document.getElementById('tags').parentElement.classList.add('error')
            return false
        }
        document.getElementById('addImageBtnF').classList.add('loading','disabled')
    }

    function filterImagesByMode(){
        console.log(city)
        let mode = document.getElementById('modalidad').value
        if(mode == 1){
            printImages(city.ImagesM1)
        }
        else if(mode == 2){
            printImages(city.ImagesM2)
        }
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
        data.forEach(function(image, index) {
            if(typeof image.score !== undefined)
            card +=`<div class="ui card" onclick="clickImage('${image.URL}',${index})">
                <div class="ui checkbox">
                    <input class="check-input" id="checkId${index}" type="checkbox" />
                <label></label>
                </div>
                <div class="card-content">
                    <div class="position">${index+1}</div>
                    <div class="image"><img src='${image.URL}' onerror="this.src='/imgs/admin/no-image.png'"/></div>
                    <div class="extra content"><i class="picture icon"></i>${typeof image.Value!=='undefined'?image.Value:'0'} ${image.Value == 1?' Punto':' Puntos'}</div>
                </div>
            </div>`
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
     * 
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