module.exports = {
	// SQl Server to Mysql types conversion based on https://dev.mysql.com/doc/workbench/en/wb-migration-database-mssql-typemapping.html
	escapar_caracteres : function(string) {
		return string.toString().replace("'",'')
			.replace('"','')
			.replace('.','')
			.replace(',','')
			.replace(';','')
			.replace('\\','')
			.replace('(','')
			.replace(')','')
			.replace('/','')
			.replace('-','')
			.replace('`','')
			.replace('á','a')
			.replace('é','e')
			.replace('í','i')
			.replace('ó','o')
			.replace('ú','u');
	},
	mysql_type: function (sqlserver_type) {
		var retorno = null;
		switch(sqlserver_type.toUpperCase()){
			case 'INT':
				retorno = 'INT'
				break;
			case 'TINYINT':
				retorno = 'TINYINT'
				break;
			case 'SMALLINT':
				retorno = 'SMALLINT'
				break;
			case 'BIGINT':
				retorno = 'BIGINT'
				break;
			case 'BIT':
				retorno = 'TINYINT(1)'
				break;
			case 'FLOAT':
				retorno = 'FLOAT'
				break;
			case 'REAL':
				retorno = 'FLOAT'
				break;
			case 'NUMERIC':
				retorno = 'DECIMAL'
				break;
			case 'DECIMAL':
				retorno = 'DECIMAL'
				break;
			case 'MONEY':
				retorno = 'DECIMAL'
				break;
			case 'SMALLMONEY':
				retorno = 'DECIMAL'
				break;
			case 'CHAR':
				retorno = 'CHAR'
				break;
			case 'NCHAR':
				retorno = 'CHAR'
				break;
			case 'DATE':
				retorno = 'DATE'
				break;
			case 'DATETIME':
				retorno = 'DATETIME'
				break;
			case 'DATETIME2':
				retorno = 'DATETIME'
				break;
			case 'SMALLDATETIME':
				retorno = 'DATETIME'
				break;
			case 'DATETIMEOFFSET':
				retorno = 'DATETIME'
				break;
			case 'TIME':
				retorno = 'TIME'
				break;
			case 'TIMESTAMP':
				retorno = 'TIMESTAMP'
				break;
			case 'ROWVERSION':
				retorno = 'TIMESTAMP'
				break;
			case 'DATETIMEOFFSET':
				retorno = 'DATETIME'
				break;
			case 'BINARY':
				retorno = 'BINARY'
				break;
			case 'VARBINARY':
				retorno = 'VARBINARY'
				break;
			case 'UNIQUEIDENTIFIER':
				retorno = 'VARCHAR(64)'
				break;
			case 'SYSNAME':
				retorno = 'VARCHAR(160)'
				break;
			case 'XML':
				retorno = 'TEXT'
				break;
			default:
				/* Casos especiales varchar y nvarchar*/
				if (sqlserver_type.toUpperCase().indexOf('VARCHAR') != -1){
					if ((sqlserver_type.toUpperCase() == 'VARCHAR(MAX)')||(sqlserver_type.toUpperCase() == 'NVARCHAR(MAX)')){
						/* no existe (N)VARCHAR(MAX) en Mysql, devolvemos LONGTEXT*/
						retorno = 'LONGTEXT';
					}else{
						retorno = sqlserver_type.toUpperCase();	
					}
					
				} else if (sqlserver_type.toUpperCase().indexOf('CHAR') != -1){
					/* Casos especiales char y nchar*/
					retorno = sqlserver_type.toUpperCase();
				}
		}
		return retorno;
	    
	}
};