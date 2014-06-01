//Room

var userlist = [];

//Game Room
  var roomnum = 0;
  var rooms = {};

//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , passport = require('passport');

//Username
var userid = Math.round(10000 * Math.random());
var username = "user" + userid;

incrementUserid = function(req,res, next) {
  userid++;
  username = "user" + userid;
  next();
};

//Session for Jade
session = function(req, res, next) {
      res.locals.user = req.session.passport.user;
      next();
    };

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.bodyParser());
    server.use(express.cookieParser('shhhhhhhhh!'));
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(passport.initialize());
    server.use(passport.session());
    server.use(session);
    server.use(server.router);
});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen(port);

//Setup Socket.IO --------------------------------------------------------------------------
var io = io.listen(server);
io.set('log level',0); //reduce logging
io.sockets.on('connection', function(socket){
  console.log('Client Connected');

  socket.on('assignsocketname', function(data){
      socket.username = data;
      userlist.push(data);
      console.log("User added to userlist." + userlist)
      socket.join('lobby');
      socket.room = 'lobby'
      socket.broadcast.to('lobby').emit('server_message',data+" just joined the lobby");
      socket.broadcast.to('lobby').emit('populate',userlist);
  });

  socket.on('createroom', function(data){
      roomnum++;
      rooms[roomnum] = 0;
      console.log(socket.room);
      //socket.broadcast.to('lobby').emit('testla',"test");
      socket.to('lobby').emit('createroom',rooms);
  });

    socket.on('populateroom', function(){
      socket.to('lobby').emit('createroom',rooms);
  });
    
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message', data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.' + socket.username);
    if (socket.room == 'lobby')
    {
      
      var index = userlist.indexOf(socket.username);
      if ( index > -1) 
      { 
        userlist = userlist.splice(index,1);
        socket.broadcast.to('lobby').emit('server_message', socket.username + " has left the lobby");
        socket.broadcast.to('lobby').emit('populate',userlist);
        console.log('User removed from user list:'+ socket.username);
      }
    }
  });
});

//Facebook passport
var FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    clientID: "351728154970202",
    clientSecret: "448bbcc0dc3898ee51845740e196061c",
    callbackURL: "http://localhost:8081/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      username = profile.displayName;
      username = username.replace(" ","");
      return done(null,profile);
    });
    /*User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });*/
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  done(null, username);
});

///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/auth/facebook',passport.authenticate('facebook'));
server.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/',
                                      failureRedirect: '/500' }));

server.get('/',incrementUserid,session, function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Enter'
             ,description: 'Home Page'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX'
             ,username: res.locals.user || username
            }
  });
});

/*
server.get('/rooms', function(req,res){
  res.render('rooms.jade', {
    locals : { 
              title : 'Rooms'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
             ,username: res.locals.user
            }
  });
});
*/

server.post('/rooms', 
  function(req, res, next) {
    res.locals.user = req.body.username;
    next();
  }, 
  function(req,res) {
    res.render('rooms.jade', {
    locals : { 
              title : 'Rooms'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
             ,username: res.locals.user
             ,userlist: userlist || null
             ,rooms: rooms
            }
  });
  });

//Room
server.post('/rooms/*', function(req, res, next){
    var roomnumber = ((req.url).split("/"))[2];
    res.local.user = req.body.username;
    if ( roomnumber <= 0 || roomnumber > roomnum || rooms[roomnumber] > 4)
    {throw new NotFound;}
    else
    {next();}
  },
 function(req,res){
    res.render('gameroom.jade', {
    locals : { 
              title : 'Rooms'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
             ,username: res.locals.user
             ,userlist: userlist || null
             ,roomnumber: res.locals.roomnumber
            }
        })
 });
//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
