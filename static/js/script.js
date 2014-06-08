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
    div.innerHTML = div.innerHTML + "<button class='btn btn-info btn-large btn-block'><span class='glyphicon glyphicon-user'></span>" + entry + "</button>";
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
    "<a href='#' class='roomspacer btn btn-default btn-success btn-lg'><span class='glyphicon glyphicon-plus'></span> Room"
     +roomnum+"["+data[roomnum]+"]</a>"  
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