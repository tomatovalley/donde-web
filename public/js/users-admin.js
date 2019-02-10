$('#formAdminModal').modal({
    transition: 'fade up',
    closable: false, 
    onDeny:   function(){
                if(document.getElementById('addBtn').classList.contains('loading'))
                    return false
            },
    onHide: function(){
        document.getElementById('addBtn').classList.remove('loading','disabled')
        document.getElementById('addAdminForm').reset()
    }
})

document.getElementById('btnModalAdmin').onclick = function(){
    $('#formAdminModal').modal('show')
}
$('.modal-admin')
  .modal({
    allowMultiple: true
  })
;
function addAdmin(){
    let inputs = document.getElementById('addAdminForm').getElementsByTagName('input')
    if(validateForm(inputs)){
        data = {
            User: inputs[0].value,
            Password: inputs[1].value,
            Name: inputs[2].value,
            Email: inputs[3].value
        }
        document.getElementById('addBtn').classList.add('loading')
        let http = new XMLHttpRequest()
        http.open('POST', '/users/addAdmin')
        http.setRequestHeader('Content-type', 'application/json')
        http.onreadystatechange = function(){
            if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
                let response = JSON.parse(this.response)
                if(response.success){
                    getUsersData(function(rs){
                        if(typeof rs.admins != 'undefined')
                            printTableAdmins(rs.admins)
                        printTableUsers(rs.users)
                        $('#formAdminModal').modal('hide')
                    })
                }
                else{
                    document.getElementById('modal-text-admin').innerHTML = response.msg
                    $('#error-modal-admin').modal('show')
                    document.getElementById('addBtn').classList.remove('loading')
                }
            }
            else if(this.readyState == XMLHttpRequest.DONE){
                document.getElementById('modal-text-admin').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
                $('#error-modal-admin').modal('show')
                document.getElementById('addBtn').classList.remove('loading')
            }
        }
        http.send(JSON.stringify(data))
    }
}

/**
 * Valida que el form esté lleno, les agrega la clase error si estan vacios 
 * @param {Array} inputs 
 */
function validateForm(inputs = []){
    let hasError = false
    let re = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    for(var property in inputs){
        if (inputs.hasOwnProperty(property) && inputs[property].value == "") {
            inputs[property].parentElement.classList.add("error")
            hasError = true;
        }
        if(inputs[property].type == "email"){
            if(!re.test(String(inputs[property].value).toLowerCase())){
                inputs[property].parentElement.classList.add("error")
                hasError = true;
            }
        }
    }
    return !hasError
}

function printTableAdmins(admins){   
    let bodyInner = ""
    admins.forEach(admin => {
        if(admin.Status){
            buttonPositive = `<button class="ui button positive" onclick="changeUserStatus('${admin._id}', true)">Activo</button>`
            buttonNegative = `<button class="ui button" onclick="changeUserStatus('${admin._id}', false)">Bloquedo</button>`
        }
        else{
            buttonPositive = `<button class="ui button" onclick="changeUserStatus('${admin._id}', true)">   Activo</button>`
            buttonNegative = `<button class="ui button negative" onclick="changeUserStatus('${admin._id}', false)"> Bloqueado</button>`
        }
        bodyInner +=`<tr style="font-size: 16px;">
                        <td class="four wide">${admin.User}</td>
                        <td class="four wide">${admin.Name}</td>
                        <td class="four wide">${admin.Email}</td>
                        <td class="four wide">
                            <div class="ui buttons">
                                ${buttonPositive}
                                <div class="or" data-text="O"></div>
                                ${buttonNegative}
                            </div>
                        </td>
                        <td class="two wide" style="font-size: 20px;"><i class="trash icon red" onclick="showDeleteModal('${admin._id}')"></i></td>
                    </tr>`
    });

    document.getElementById('adminsTableBody').innerHTML = bodyInner

}