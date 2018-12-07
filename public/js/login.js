
function doLogin(){
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
            if(response.success){
                //window.location.replace('/admin');
            }
            else{
                alert(response.msg);
            }
         }
    }
    Http.send(JSON.stringify(data));
}