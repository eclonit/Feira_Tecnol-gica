var express = require('express'); 				// inclui a biblioteca 'express'
var appExpress = express(); 					// linka 'appExpress' com o contrutor 'express()'
var path = require("path"); 					// inclui a biblioteca 'path'
var fs = require("fs"); 					// inclui a biblioteca 'file system'
var inspect = require('object-inspect'); 			// inclui a biblioteca 'object-inspect'
var Gpio = require("onoff").Gpio; 				// inclui a biblioteca GPIO

var BOTAO0 = new Gpio(21, 'in', 'both', {debounceTimeout: 10}); // cria os botoes e configura-os
var BOTAO1 = new Gpio(20, 'in', 'both', {debounceTimeout: 10}); // para saida de
var BOTAO2 = new Gpio(16, 'in', 'both', {debounceTimeout: 10}); // ambos os lados
var BOTAO3 = new Gpio(12, 'in', 'both', {debounceTimeout: 10}); //

var LEDVERMELHA = new Gpio(17, 'out'); 				// instancia a LEDVERMELHA
var LEDVERDE = new Gpio(27, 'out'); 				// instancia a LEDVERDE

var http = require('http').Server(appExpress); 			// inclui a biblioteca 'http' e cria um servidor utilizando o appExpress

var io = require('socket.io')(http); 				// inclui a biblioteca 'socket.io' e passa o servidor de referência para execução
var canalLed = io.of('\canalLed');


appExpress.use(express.static('public')); 			// configura o servidor para utilizar a pasta pública

const bodyParser = require('body-parser'); 			// inclui a biblioteca 'body-parser'
const middlewares = [
		express.static(path.join(__dirname + 'public')),
		bodyParser.json(),
		bodyParser.urlencoded({extended : true})
	];

appExpress.use(middlewares); 					// o servidor passa a utilizar as configurações do vetor 'middlewares'
appExpress.get('/', function(req, res){ 			// o servidor executa como referência primária o 'index.html' em 'src'
		res.sendFile( __dirname + '/src/index.html');
	});

appExpress.use('/libraries', express.static('node_modules')); 	//manda o servidor utilizar as bibliotecas da pasta node_modules

io.sockets.on('connection', function (socket) {			// cria uma conecção websocket utilizando o namespace 'connection'

  socket.on("canalBotoes", function(){
    BOTAO0.watch(function (err, value) {
	if(err){
		console.log("erro ocorreu no botao0");
		throw err;
	}
	if(value != 0){
		unwatchAll();
		socket.emit("canalBotoes", 0);
		}
	});							 // assiste a todos os botoes
    BOTAO1.watch(function (err, value) {
	if(err){
		console.log("erro ocorreu no botao1");
		throw err;
	}
	if(value != 0){
		unwatchAll();
		socket.emit("canalBotoes", 1);
		}
	});
    BOTAO2.watch(function (err, value) {
	if(err){
		console.log("erro ocorreu no botao2");
		throw err;
	}
	if(value != 0){
		unwatchAll();
	 	socket.emit("canalBotoes", 2);
		}
	});
    BOTAO3.watch(function (err, value) {
	if(err){
		console.log("erro ocorreu no botao3");
		throw err;
	}
	if(value != 0){
		unwatchAll();
	 	socket.emit("canalBotoes", 3);
		}
	});
});

    socket.on("canalLeds", function(resposta) { 			//pega o valor enviado pelo arquivo .html

	var interval = setInterval(function(){
		if (resposta == 1) { 				//verifica qual led é para ligar
        	if(LEDVERMELHA.readSync() == 0) 		// verifica se a led vermelha está desligada
                	LEDVERMELHA.writeSync(1); 		//liga a led vermelha se ela estiver desligada
        	else LEDVERMELHA.writeSync(0); 			// caso contrário, desliga o led
        	}
        	else if(resposta == 2){  			// se a resposta do cliente for 2 liga a led verde

        	if(LEDVERDE.readSync() == 0) 			// verifica se o led verde está desligado
                	LEDVERDE.writeSync(1); 			// liga o led verde se ele estiver desligado
        	else LEDVERDE.writeSync(0); 			// caso contrário, desliga o led
	        }

	}, 250); 						// executa a função do parâmetro a cada 0,250 segundos
	var clearT = function(){ clearInterval(interval); LEDVERMELHA.writeSync(0); LEDVERDE.writeSync(0); };
	setTimeout(clearT, 1000); 				// chama a função do parâmetro após 1 segundo
  });   							//fim de 'socket.on()'
});								//fim de 'io.sockets.on()'

process.on('SIGINT', function () { 				//quando 'ctrl+c' for pressionado
  LEDVERMELHA.writeSync(0); 					// deliga a led vermelha
  LEDVERMELHA.unexport(); 					// deleta o objeto 'LEDVERMELHA'
  LEDVERDE.writeSync(0); 					// desliga a led verde
  LEDVERDE.unexport(); 						// deleta o objeto 'LEDVERDE'
  BOTAO0.unexport(); 						// deleta o objeto 'BOTAO0'
  BOTAO1.unexport(); 						// deleta o objeto 'BOTAO1'
  BOTAO2.unexport(); 						// deleta o objeto 'BOTAO2'
  BOTAO3.unexport(); 						// deleta o objeto 'BOTAO3'
  process.exit(); 						//finaliza o programa completamente
});

http.listen(3000, function(){ 					// servidor conectado na porta 3000
  console.log('servidor on-line em: localhost:3000'); 		// mostra que o servidor está funcionando
});
