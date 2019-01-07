
function doLogin(){
    $('.dimmer').dimmer({
            closable: false
        }).dimmer('show');

    data = {
        User: document.getElementById('user').value,
        Password: document.getElementById('pass').value
    }
    const Http = new XMLHttpRequest();
    Http.open("POST", '/api/doLogin', true);
    Http.setRequestHeader('Content-type', 'application/json');
    Http.onreadystatechange= function(){
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            const response = JSON.parse(Http.response);
            $('.dimmer').dimmer('hide');
            if(response.success){
                if(response.userType == 1){
                    window.location.href = '/home';
                }
            }
            else{
                document.getElementById('modal-text').innerHTML = response.msg;
                $('.tiny.modal').modal('show');
            }
        }
        
        else if(this.readyState == XMLHttpRequest.DONE){
            $('.dimmer').dimmer('hide');
            document.getElementById('modal-text').innerHTML = "Error en la conexión al servidor."
            $('.tiny.modal').modal('show');
        }
    }
    Http.send(JSON.stringify(data));

    
}