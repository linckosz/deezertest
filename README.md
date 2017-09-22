DEEZER test By Bruno Martin (September 14th, 2017)
==============

Server machine Operating system
--------------
The application has been developed and tested on the following system (LNMP):
   - CentOS 6.9 (64bit)
   - nginx 1.10.2
   - MariaDB Server 10.2.6
   - Server API FPM/FastCGI
   - PHP 7.0.20
   - PHP Modules<br />
bcmath bz2 calendar Core ctype curl date dba dom enchant exif fileinfo filter ftp gd geoip gettext hash iconv igbinary imagick imap interbase intl json json_post ldap libxml maxminddb mbstring mcrypt memcache memcached mongodb msgpack mysqli mysqlnd OAuth openssl pcntl pcre PDFlib PDO PDO_Firebird pdo_mysql pdo_sqlite Phar pinyin posix pspell readline recode Reflection session shmop SimpleXML snmp soap sockets SPL sqlite3 ssh2 standard sysvmsg sysvsem sysvshm tidy tokenizer uploadprogress wddx xdebug xdiff xml xmlreader xmlrpc xmlwriter xsl Zend OPcache zip zlib Xdebug Zend OPcache

Test machine Operating system
--------------
All tests have been done using the following environment.<br />
Even if the code has been thought cross-compatible, it needs to be tested on other browsers.
   - Windows 8.1 (64-bit) English
   - Google Chrome Version 60.0.3112.113 (Official Build) (64-bit)

Installation
--------------
1. NGINX
   - The file '/_INSTALLATION/nginx_back.conf' contains the nginx configuration needed for SUBJECT #1.
   - The file '/_INSTALLATION/nginx_front.conf' contains the nginx configuration needed for SUBJECT #2.
   - Make sure to adapt those files according to your server, especially pathes.
   - Include the path to these 2 files to your nginx confguration file.

2. SSL
SSL for the domain brunodz.tk are available here:
   - '/_INSTALLATION/brunodz.tk.crt'
   - '/_INSTALLATION/brunodz.tk.key'

3. SQL
   - Import the file '/_INSTALLATION/demo_deezer.sql', it will create the database and the user 'demo_deezer' used by the PHP application.
   - The schema structure is available as a picture here: '/_INSTALLATION/demo_deezer_schema.png'.
   - The hostname restriction for the user 'demo_deezer' is '192.168.1.%', modified it according to your connection setting. If any issue, just use the wildcard '%'.
   - If the logic code (alias PHP) is well written, I prefer to not use foreign keys, they can drastically slow down the application.
   - To keep track of Create/Update/Delete operation, I do not use Timestamp because a gap of a second is to big and can be annoying for users when sorting mixed models. Instead, I use an interger giving milliseconds of UNIX time.

4. Database connection
   - The file '/config/Database.php' contains connection information for the PHP application. If any issue with the user 'demo_deezer', just use the root user.

5. LINUX permission
Launch a LINUX bash command to insure all permissions are setup correctly.<br />
Need to go the the root directory of the application first.
```
# cd /path_to
# sh /_INSTALLATION/permission root
# yum install realpath
# service nginx restart
```

6. DEEZER AUTHENTICATION
 - In the file '/_INSTALLATION/nginx_front.conf', update both FastCGI variables DEEZER_API_ID and DEEZER_SECRET to your corresponding application values for authentication


NOTE
--------------
The code is vanilla (PHP and JS), without the help of any external library.<br />
A MVC structure structure has been designed to give the flexibility requested.<br />
It should be pretty obvious, but I'd prefer to remind that this code structure is not production-ready, it's only for candidature purpose.<br />
Since user authentication was not allowed, I just used a API key to secure the communication.<br />
Here are some advantages of this configuration:
   - Can add more models (create a file like '/bundles/api/models/data/toto.php').
   - We can add new attributes (need to modify the table, the setItems method, and few parameters like the $model_visible attribute).
   - We can create new output (need to add more in the file '/libs/Render.php').
   - We code load only the bundles we need for a specific request (only if we want, this can help to have one singular code to maintain for frontend and backend, it can help to save time).
   - Can insert variables inside HTML code.
   - Any JS file, CSS file, or picture modified will be automatically refreshed on client side, the application recognize the modification timestamp of each file, no need manual operation from the developer (for example, no need to hardly code '/images/toto.png?v=2').
   - It accepts connection to multiple databases.
   - All Errors, JS and PHP, are stored in the directories '/logs/js' and '/logs/php'.
   - By using the method '/libs/Watch::php()', we can watch PHP variable, data are stored in the directory '/logs'.
   - Internationalization support, uncomment "$deezer->setLanguage('fr');" in '/back.php' to use French for the subject No1. There is a button to switch the language on the UI of subject No2.
<br />
<br />
<br />
<br />
<br />
<br />
--------------

Sujet 1 : Créer une mini API
==============
Développer en PHP une mini API REST avec output des données en JSON.

Exercise 1
--------------
1. Mettre en place de quoi pouvoir récupérer les données :<br />
   a. d'un utilisateur en fonction de son identifiant, les données étant son identifiant, son nom, son Email,<br />
   b. d’une chanson en fonction de son identifiant, les données étant son identifiant, son nom, sa durée.

Demo page
--------------
https://api.brunodz.tk

1-1a
--------------
```
Request URL: https://api.brunodz.tk/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{    => Used store data we want to send to the API, the following pattern helps to regroup multiple CRUD operations on multiple models, it can help to save bandwidth and server CPU consumption by limiting the call numbers.
        "read":{    => Used to specified CRUD request, it can be "read", "delete", or "set" (which includes to create+update)  .
            "user":{    => The model name, it can be "user", "song", or "playlist".
                "1":{    => Any string we want, it's just a key (unused on API) to store multiple objects.
                    "id":1,    => The object ID.
                    "md5":"8f30ddb8d80ccd2b"    => The object MD5, it's used to secure CRUD operations ("delete & restore" need all the 32 characters, "create & update" need at least the 16 first characters, "read" needs at least the 8 first characters). The API will only give to the client the authorized length of the MD5. For instance, we can see that the user is only 16 characters because we don't allow deletion.
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4" => The API key to secure the communication.
}
```

1-1b
--------------
```
Request URL: https://api.brunodz.tk/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "song":{
                "1":{
                    "id":1,
                    "md5":"89bcee85e5d53ee79d70ebd026a7c188"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```

Exercise 2
--------------
2. Cette API doit aussi être capable de renvoyer les chansons favorites d'un utilisateur. Elle doit permettre de :<br />
   a. récupérer cette liste,<br />
   b. ajouter une chanson dans cette liste,<br />
   c. enlever une chanson de cette liste.<br />

1-2a
--------------
```
Request URL: https://bruno.api.brunodz.tk/playlist/favoritesongs
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "user":{    => We use the user, because we want to grab its favorite playlist information.
                "1":{
                    "id":1,
                    "md5":"8f30ddb8d80ccd2b"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```

1-2b
--------------
NOTE: We split into 2 commands here
- 1st request => Add a song (which is actually the request)
```
Request URL: https://bruno.api.brunodz.tk/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "set":{    => We use "set" here because it's an update
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8",
                    "_attach":{    => We attach models together (it juts do nothing if not accepted by the API), it can be "_attach" or "_detach".
                        "0":{    => Any string we want, it's just a key (unused on API) to store multiple objects.
                            "0":"song",    => The type of the model we want to attach/detach.
                            "1":5,    => The ID of the model we want to attach/detach.
                            "2":"e70ec532c5a4da739965216bfb733730"    => The MD5 of the model we want to attach/detach.
                        }
                    }
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```
- 2nd request => Grab the updated list
```
Request URL: https://bruno.api.brunodz.tk/playlist/favoritesongs
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```

1-2c
--------------
NOTE: We split into 2 commands here
- 1st request => Add a song (which is actually the request)
```
Request URL: https://bruno.api.brunodz.tk/data
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "set":{
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8",
                    "_detach":{    => We detach models.
                        "0":{
                            "0":"song",
                            "1":5,
                            "2":"e70ec532c5a4da739965216bfb733730"
                        }
                    }
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```
- 2nd request => Grab the updated list
```
Request URL: https://bruno.api.brunodz.tk/playlist/favoritesongs
Request Method: POST
Remote Address: 120.234.18.50:443
Request Payload (JSON string):
{
    "param":{
        "read":{
            "playlist":{
                "1":{
                    "id":1,
                    "md5":"54d40443deff03162a6ebb057c8380c8"
                }
            }
        }
    },
    "key":"38e30d84swe0ef799duy5cc4"
}
```
<br />
<br />
<br />
<br />
<br />
<br />


Sujet 2 : Playlist mise à jour à la volée ( sujet optionnel)
==============

Exercise 1
--------------
En utilisant notre SDK JS disponible sur http://developers.deezer.com/sdk/javascript, mettre en place une playlist se rafraîchissant à chaque ajout de chansons à celle-ci.<br />
L'idée est qu'à partir d'une playlist vous appartenant et en cours de lecture grâce au SDK JS, si vous ajoutez des chansons à la volée par l’intermédiaire de l’API, celle-ci apparaisse dans cette playlist et puisse être jouée.

Demo page
--------------
https://brunodz.tk

Notes
-------------
   - CDN servers are not accessible in China, "dz.js" and musics cannot be downloaded => It needs a VPN access.
   - I had code issue 201 "Account permission restricted - waiting for payment." even if I could get an access_token using a premium account. The same issue appears in the "API explorer", not sure if it's related to my IP location.

2-1
--------------
I was not able yet to solve the access issue, so I did created a fake playlist (hardcoded) to simulae some operations.<br />
I prepared some playlist commands in the file '\bundles\web\public\scripts\web.js', object 'web_action', but without being able to work with any response, I cannot confirm if it works properly.
<br />
<br />
<br />
<br />
<br />
<br />

Conclusion
==============
Thank you for taking the time to consider my candidature as a Senior Developer.<br />
I wish that you will be able to see the skills you are looking for in this source code.

Regards,

Bruno Martin
