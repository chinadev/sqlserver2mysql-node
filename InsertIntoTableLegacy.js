var sql = require('mssql'); 
var mysql      = require('mysql');
var helper = require ('./helper');
var config = require('./config');
 
var configSqlServer = config.configSqlServer;
var cadenaConexionMysql = config.configMysql;

//var tablaAMigrar = 'Alumnos';
//var tablaAMigrar = 'AccionesFormativas';
var tablaAMigrar = 'SolicitudesWeb';
var tablaDestinoMigracion = 'SolicitudesWebAntiguas'
//var tablaAMigrar = 'Convocatoria';

var queryOrigenSqlServer = 'select * from (' +
    'select row_number() over (ORDER BY IdAccion, IdAlumno) as IdSolicitud,* ' +
    'from SolicitudesWeb) #tmp' +
    ' where IdSolicitud between 700001 and 800000';


var ultimoIdUtilizado= 482890;

var querysParaInsertar = [];


sql.connect(configSqlServer, function(err) {
    
    var request = new sql.Request();
    request.stream = true; // You can set streaming differently for each request 
    request.query(queryOrigenSqlServer); // or request.execute(procedure); 
    
    request.on('recordset', function(columns) {
        // Emitted once for each recordset in a query 
        //console.log(columns);
    });
    
    request.on('row', function(row) {
        /* Para cada campo de la tabla SQL, si existe equivalencia en Mysql añado
            una linea a la query para crear la tabla */

        var queryInsertarMysql = 'Insert INTO ' + tablaDestinoMigracion + ' VALUES (';

        for(var attributename in row){

    		if ( row[attributename] == null){
    			queryInsertarMysql = queryInsertarMysql + 'null,';
            } else if (typeof i == "number") {
    			queryInsertarMysql = queryInsertarMysql + row[attributename] + ',';
			} else {    		
				/* Compruebo si es una fecha */
				if (row[attributename].toString().indexOf('GMT') != -1){
					var date = new Date(row[attributename].toString());
					queryInsertarMysql = queryInsertarMysql + "'" + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay() + "',";
				/* Es una cadena de texto. Tengo que convertir los booleanos a tinyint */
				}else {
					switch(row[attributename].toString()){
						case 'true':
							queryInsertarMysql = queryInsertarMysql + '1,';
							break;
						case 'false':
							queryInsertarMysql = queryInsertarMysql + '0,';
							break;
						default:
							queryInsertarMysql = queryInsertarMysql + "'" + helper.escapar_caracteres(row[attributename]) + "',";
							break;
					}
				}
    		}
		}

		/* He metido una coma de más */
		queryInsertarMysql = queryInsertarMysql.substring(0, queryInsertarMysql.length - 1) + ')';

		querysParaInsertar[querysParaInsertar.length] = queryInsertarMysql;


		


    });
    
    request.on('error', function(err) {
        // May be emitted multiple times 
        console.log('error');
        console.log(err);
    });
    
    request.on('done', function(returnValue) {

    	console.log(querysParaInsertar.length)
        console.log(querysParaInsertar[0]);

        /* Insertar en Mysql */
		var connection = mysql.createConnection(cadenaConexionMysql);
		for (var i=0;i<querysParaInsertar.length;i++){
			connection.query(querysParaInsertar[i], function(err, result){

	            if (err != null){
	                console.log('Error al insertar la fila');
	                console.log(err);
	                console.log('Query que causó el error:');
	                //process.exit(code=-1);
	            }
	        });
			if (i % 1000 == 0){
				console.log('Insertada fila ' + i + ' de ' + querysParaInsertar.length);
			}
		}

		connection.end();
        console.log('fin');
    });
});                          