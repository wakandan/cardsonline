$(document).ready(function() {   

  var objDiv = document.getElementById('chat-box');
  var roomnumber = document.getElementById('gameroom').value
  var socket = io.connect();
  //socket.emit('assignsocketnamegameroom', document.getElementById('username').value); 
  socket.emit('populategameroom',roomnumber)
  console.log(roomnumber)

  
  socket.on('populategameroom1', function(data){
    console.log("test")
    var test = data;
    document.getElementById('users-box').innerHTML = "";
    test.forEach(function(entry){
    var div = document.getElementById('users-box');
    div.innerHTML = div.innerHTML + "<button class='btn btn-info btn-large btn-block'><span class='glyphicon glyphicon-user'></span>" + entry + "</button>";
    });  
  });

    function socketsend()
  {
    var mess = document.getElementById('chat-input').value
    socket.emit('messagegameroom', document.getElementById('username').value +" : "+ mess);  
    document.getElementById("chat-input").value = "";  
    objDiv.scrollTop = objDiv.scrollHeight;
  } 

    $('#send-button').bind('click', function() {
    socketsend();  

  });

      socket.on('server_message_gameroom', function(data){
   $('#chat-box').append('<p>' + data + '</p>');  
   value = $('#chat-box').value + data;
   $('#chat-box').value = value;
   objDiv.scrollTop = objDiv.scrollHeight;
  });


});