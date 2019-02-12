/**
 * 
 * @param {String} user_id  Id del usuario que quiere cambiar 
 * @param {Boolean} status   Recibe true or false para activar o desactivar un usuario
 */
function changeUserStatus(user_id, status){
    let http = new XMLHttpRequest()
    http.open("PUT", '/users/changeUserStatus', true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
            let response = JSON.parse(this.response)
            if(response.success){
                getUsersData(function(rs){
                    if(typeof rs.admins != 'undefined')
                        printTableAdmins(rs.admins)
                    printTableUsers(rs.users)
                })
            }
            else if(!response.success){
                document.getElementById('modal-text-admin').innerHTML = "No se pudo cambiar el estatus del usuario.";
                $('#error-modal').modal('show')
            }
        }
        else if(this.readyState == XMLHttpRequest.DONE){
            document.getElementById('modal-text-admin').innerHTML = "No se ha podido conectar al servidor, revise su conexión a internet.";
            $('#error-modal').modal('show')
        }
    }
    http.send(JSON.stringify({user_id: user_id, status: status}))
}

function getUsersData(callback){
    let http = new XMLHttpRequest()
    http.open("GET", '/users/usersData', true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
            rs = JSON.parse(this.response)
            if(rs.success){
                callback(rs)
            }
        }
    }
    http.send()
}
function printTableUsers(users){
    let bodyInner = ""
    users.forEach(user => {
        if(user.Status){
            buttonPositive = `<button class="ui button positive" onclick="changeUserStatus('${user._id}', true)">Activo</button>`
            buttonNegative = `<button class="ui button" onclick="changeUserStatus('${user._id}', false)">Bloquedo</button>`
        }
        else{
            buttonPositive = `<button class="ui button" onclick="changeUserStatus('${user._id}', true)">   Activo</button>`
            buttonNegative = `<button class="ui button negative" onclick="changeUserStatus('${user._id}', false)"> Bloqueado</button>`
        }
        bodyInner +=`<tr style="font-size: 16px;">
                        <td>${user.User}</td>
                        <td>${user.Name}</td>
                        <td>${user.Email}</td>
                        <td>
                            <i class="diamond icon"></i>
                            <div style="display: inline-block;width:50%;">${user.Score}</div>
                        </td>
                        <td>
                            <div class="ui buttons">
                                ${buttonPositive}
                                <div class="or" data-text="O"></div>
                                ${buttonNegative}
                            </div>
                        </td>
                        <td style="font-size: 20px;"><i class="trash icon red" onclick="showDeleteModal('${user._id}')"></i></td>
                    </tr>`
    });
    document.getElementById('usersTableBody').innerHTML = bodyInner
}

function deleteUser(user_id){
    let http = new XMLHttpRequest()
    http.open("DELETE", '/users/deleteUser', true);
    http.setRequestHeader('Content-type', 'application/json');
    http.onreadystatechange = function(){
        if(this.readyState == XMLHttpRequest.DONE && this.status == 200){
            let response = JSON.parse(this.response)
            if(response.success){
                getUsersData(function(rs){
                    if(typeof rs.admins != 'undefined')
                        printTableAdmins(rs.admins)
                    printTableUsers(rs.users)
                })
            }
            else{
                document.getElementById('modal-text').innerHTML = "No se pudo cambiar eliminar el usuario.";
                $('#error-modal').modal('show')
            }
        }
        else if(this.readyState == XMLHttpRequest.DONE){
            document.getElementById('modal-text').innerHTML = "Algo ha sucedido, intentelo de nuevo.";
            $('#error-modal').modal('show')
        }
    }
    http.send(JSON.stringify({user_id: user_id}))
}

function showDeleteModal(user_id){
    document.getElementById('confirmUpdate').onclick = function(){
        deleteUser(user_id)
    }
    $('#confirm-delete').modal('show')
}

function filter(){
    const users = $('#usersTableBody tr')
    const admins = $('#adminsTableBody tr')
    var value = $('#filter').val().toLowerCase();
    users.filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
    admins.filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });
}