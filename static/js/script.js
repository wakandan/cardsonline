$(document).ready(function() {   

  var objDiv = document.getElementById('chat-box');
  var socket = io.connect();
  socket.emit('assignsocketname', document.getElementById('username').value); 
  socket.emit('populateroom','populateroom')
  function socketsend()
  {
    var mess = document.getElementById('chat-input').value
    socket.emit('message', document.getElementById('username').value +" : "+ mess);  
    document.getElementById("chat-input").value = "";  
    objDiv.scrollTop = objDiv.scrollHeight;
  } 

  $('#send-button').bind('click', function() {
    socketsend();  

  });

    $('#populateroom').bind('click', function() {
    socket.emit('populateroom','populateroom');  

  });

  socket.on('populate', function(data){
    var test = data;
    document.getElementById('users-box').innerHTML = "";
    test.forEach(function(entry){
    var div = document.getElementById('users-box');
    div.innerHTML = div.innerHTML + "<button class='btn btn-inverse btn-large btn-block'><span class='glyphicon glyphicon-user'></span>" + entry + "</button>";
    });  
  });

  socket.on('server_message', function(data){
   $('#chat-box').append('<p>' + data + '</p>');  
   value = $('#chat-box').value + data;
   $('#chat-box').value = value;
   objDiv.scrollTop = objDiv.scrollHeight;
  });


  socket.on('createroom', function(data){
    var div = document.getElementById('rooms');
    div.innerHTML = "";
    for (var roomnum in data) {
    var div = document.getElementById('rooms');
    div.innerHTML = div.innerHTML + 
    "<form method='POST' action='rooms/"+roomnum+"'>"+
    "<input id='username' type='hidden' name='username' placeholder='username' value='" +
    document.getElementById('username').value +
    "' class='form-control'/>"+
    "<button id='gotoroom' type='submit' class='btn btn-default btn-info btn-sm col-sm-2'>"+
    "<span class='glyphicon glyphicon-expand'>"+
    "</span>Room#"+roomnum+"["+data[roomnum]+"]</button></form>"; 
    
    };
  });
 

  document.getElementById("chat-input").addEventListener("keydown", function(e) {
    if (!e) { var e = window.event; }
    
    // Enter is pressed
    if (e.keyCode == 13) { 
   socketsend();}
}, false);

  $('#createroom').bind('click', function() {
    socket.emit('createroom','createroom');
  });



});