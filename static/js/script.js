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
  var blackcard;
   $.getJSON("/blackcards",function(data){
    for ( i = 1 ; i <= 5 ; i++)
  {
    document.getElementById('blackcard'+i).innerHTML = data;
  }

  });
  
  socket.on('populate', function(data){
    var test = data;
    var i = 1;
    document.getElementById('users-box').innerHTML = "";
    test.forEach(function(entry){
    document.getElementById('blackcardtitle'+i).innerHTML = entry;

    i++;
    var div = document.getElementById('users-box');
    div.innerHTML = div.innerHTML + "<button class='btn btn-info btn-block'><span class='glyphicon glyphicon-user'></span>" + entry + "</button>";
    });  
  });

  socket.on('server_message', function(data){
   $('#chat-box').append('<p>' + data + '</p>');  
   value = $('#chat-box').value + data;
   $('#chat-box').value = value;
   objDiv.scrollTop = objDiv.scrollHeight;
  });

 

  document.getElementById("chat-input").addEventListener("keydown", function(e) {
    if (!e) { var e = window.event; }
    
    // Enter is pressed
    if (e.keyCode == 13) { 
   socketsend();}
}, false);

});