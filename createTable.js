var sql = require('mssql'); 
var mysql      = require('mysql');
var helper = require ('./helper');
var config = require('./config');
 
var configSqlServer = config.configSqlServer;

var cadenaConexionMysql = config.configMysql;

/*var tablaAMigrar = 'Alumnos';
var clavePrimaria = 'IdAlumno';*/
/*var tablaAMigrar = 'AccionesFormativas';
var clavePrimaria = 'idAccion';*/
/*var tablaAMigrar = 'SolicitudesWeb';
var clavePrimaria = 'idSolicitudesWeb';*/
/*var tablaAMigrar = 'Convocatoria';
var clavePrimaria = 'idConvocatoria';*/
var tablaAMigrar = 'SolicitudesWeb';
var clavePrimaria = 'idSolicitud';

var queryDescribeAlumnos = "SELECT column_name AS [name]," +
                                "IS_NULLABLE AS [isnull]," +
                                "DATA_TYPE + COALESCE('(' + CASE WHEN CHARACTER_MAXIMUM_LENGTH = -1 " +
                                " THEN 'Max'" +
                                " ELSE CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR(5))" +
                                " END + ')', '') AS [type]" +
                            " FROM   INFORMATION_SCHEMA.Columns" + 
                            " WHERE  table_name = '" + 
                            tablaAMigrar + "'";

console.log(queryDescribeAlumnos);

var queryCrearTabla = 'CREATE TABLE ' + 'SolicitudesWebAntiguas' +  ' (';
//Insertar campo para autofirmado, solicitudes web antiguas
queryCrearTabla = queryCrearTabla + 'IdSolicitud INT NOT NULL,'
//fin ñapa
var camposNoMigrados = [];
var numCamposNoMigrados = 0;
 
sql.connect(configSqlServer, function(err) {
    
    var request = new sql.Request();
    request.stream = true; // You can set streaming differently for each request 
    request.query(queryDescribeAlumnos); // or request.execute(procedure); 
    
    request.on('recordset', function(columns) {
        // Emitted once for each recordset in a query 
        //console.log(columns);
    });
    
    request.on('row', function(row) {
        /* Para cada campo de la tabla SQL, si existe equivalencia en Mysql añado
            una linea a la query para crear la tabla */

        console.log('==========')
        console.log(row.name);
        console.log(row.type);
        console.log(row.isnull);
        console.log('---------')
        console.log(helper.mysql_type(row.type));

        if (helper.mysql_type(row.type) != null){
            /*Se encontró equivalencia del tipo de campo en Mysql*/
            queryCrearTabla = queryCrearTabla + row.name + ' ' + helper.mysql_type(row.type);

            if (row.isnull == 'NO'){
                queryCrearTabla = queryCrearTabla + ' NOT NULL'
            }

            queryCrearTabla = queryCrearTabla + ','    
        }else{
            /* No se encontró equivalencia, por lo que se guarda el nombre del campo para no insertarlo*/
            camposNoMigrados[numCamposNoMigrados] = row.name;
            numCamposNoMigrados++;

        }

        

    });
    
    request.on('error', function(err) {
        // May be emitted multiple times 
        console.log('error');
        console.log(err);
    });
    
    request.on('done', function(returnValue) {
        // Always emitted as the last one 
        console.log('fin');
        queryCrearTabla = queryCrearTabla + 'PRIMARY KEY(' + clavePrimaria + '))';

        console.log(queryCrearTabla);

        /* Conectar a Mysql y crear la tabla */
        var connection = mysql.createConnection(cadenaConexionMysql);

        connection.query(queryCrearTabla, function(err, result){

            if (err != null){
                console.log('Error al crear tabla mysql');
                console.log(err);
                process.exit(code=-1);
            } else {
                console.log('Tabla creada correctamente');
                console.log(camposNoMigrados);
                process.exit(code=0);
            } 
        });


    });
});

