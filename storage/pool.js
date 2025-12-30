const mariadb=require('mariadb');const pool=mariadb.createPool({host:'127.0.0.1',port:3306,user:'appuser',password:'Str0ng_AppDown_P@ss_2025',database:'appdown'});module.exports=pool;
